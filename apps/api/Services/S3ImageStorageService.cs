using Amazon.S3;
using Amazon.S3.Model;

namespace Aroundtheway.Api.Services;

public class S3ImageStorageService : IImageStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly string _baseUrl;
    private readonly ILogger<S3ImageStorageService> _logger;

    public S3ImageStorageService(IAmazonS3 s3Client, IConfiguration configuration, ILogger<S3ImageStorageService> logger)
    {
        _s3Client = s3Client;
        _bucketName = configuration["AWS:BucketName"] ?? "product-images";
        _baseUrl = configuration["Supabase:Url"] ?? "";
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(IFormFile file, string productId)
    {
        try
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is null or empty");

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                throw new ArgumentException($"File type {file.ContentType} is not allowed");

            // Validate file size (max 5MB)
            // if (file.Length > 5 * 1024 * 1024)
            //     throw new ArgumentException("File size exceeds 5MB limit");

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            var fileName = $"{productId}/{Guid.NewGuid()}{fileExtension}";

            // Upload to S3-compatible Supabase storage
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            memoryStream.Position = 0;

            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                InputStream = memoryStream,
                ContentType = file.ContentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.None,
                CannedACL = S3CannedACL.PublicRead // Make images publicly accessible
            };

            await _s3Client.PutObjectAsync(request);

            _logger.LogInformation("Successfully uploaded image: {FileName}", fileName);
            return fileName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image for product {ProductId}", productId);
            throw;
        }
    }

    public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string productId)
    {
        var uploadedFiles = new List<string>();

        try
        {
            foreach (var file in files)
            {
                var fileName = await UploadImageAsync(file, productId);
                uploadedFiles.Add(fileName);
            }

            return uploadedFiles;
        }
        catch (Exception ex)
        {
            // If any upload fails, attempt to clean up already uploaded files
            foreach (var uploadedFile in uploadedFiles)
            {
                try
                {
                    await DeleteImageAsync(uploadedFile);
                }
                catch (Exception cleanupEx)
                {
                    _logger.LogWarning(cleanupEx, "Failed to cleanup uploaded file: {FileName}", uploadedFile);
                }
            }

            _logger.LogError(ex, "Error uploading multiple images for product {ProductId}", productId);
            throw;
        }
    }

    public async Task<string> GetImageUrlAsync(string fileName)
    {
        try
        {
            var publicUrl = $"{_baseUrl}/storage/v1/object/public/{_bucketName}/{fileName}";
            _logger.LogInformation("Generated public URL: {ImageUrl} for file: {FileName}", publicUrl, fileName);
            return publicUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting image URL for: {FileName}", fileName);
            throw;
        }
    }

    public async Task<bool> DeleteImageAsync(string fileName)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.DeleteObjectAsync(request);

            _logger.LogInformation("Successfully deleted image: {FileName}", fileName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image: {FileName}", fileName);
            return false;
        }
    }

    public async Task<List<string>> GetProductImagesAsync(string productId)
    {
        try
        {
            var request = new ListObjectsV2Request
            {
                BucketName = _bucketName,
                Prefix = $"{productId}/",
                MaxKeys = 100
            };

            var response = await _s3Client.ListObjectsV2Async(request);
            return response.S3Objects.Select(obj => obj.Key).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images for product {ProductId}", productId);
            return new List<string>();
        }
    }
}