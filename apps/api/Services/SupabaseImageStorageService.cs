using Supabase;
using Supabase.Storage;

namespace Aroundtheway.Api.Services;

public class SupabaseImageStorageService : IImageStorageService
{
    private readonly Supabase.Client _supabaseClient;
    private readonly string _bucketName;
    private readonly ILogger<SupabaseImageStorageService> _logger;

    public SupabaseImageStorageService(Supabase.Client supabaseClient, IConfiguration configuration, ILogger<SupabaseImageStorageService> logger)
    {
        _supabaseClient = supabaseClient;
        _bucketName = configuration["Supabase:BucketName"] ?? "product-images";
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
            if (file.Length > 5 * 1024 * 1024)
                throw new ArgumentException("File size exceeds 5MB limit");

            // Generate unique filename
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            var fileName = $"{productId}/{Guid.NewGuid()}{fileExtension}";

            // Convert file to byte array
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            // Upload to Supabase storage
            await _supabaseClient.Storage
                .From(_bucketName)
                .Upload(fileBytes, fileName, new Supabase.Storage.FileOptions
                {
                    ContentType = file.ContentType,
                    Upsert = false
                });

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
            // Get public URL for the image
            var url = _supabaseClient.Storage
                .From(_bucketName)
                .GetPublicUrl(fileName);

            return url;
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
            await _supabaseClient.Storage
                .From(_bucketName)
                .Remove(new List<string> { fileName });

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
            // List all files in the product folder
            var files = await _supabaseClient.Storage
                .From(_bucketName)
                .List(productId);

            return files.Select(f => $"{productId}/{f.Name}").ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images for product {ProductId}", productId);
            return new List<string>();
        }
    }
}