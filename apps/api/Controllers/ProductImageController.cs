using Aroundtheway.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aroundtheway.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductImageController : ControllerBase
{
    private readonly IImageStorageService _imageStorageService;
    private readonly ILogger<ProductImageController> _logger;

    public ProductImageController(IImageStorageService imageStorageService, ILogger<ProductImageController> logger)
    {
        _imageStorageService = imageStorageService;
        _logger = logger;
    }

    [HttpPost("upload/{productId}")]
    public async Task<IActionResult> UploadImage(string productId, IFormFile file)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(productId))
                return BadRequest("Product ID is required");

            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            var fileName = await _imageStorageService.UploadImageAsync(file, productId);
            var imageUrl = await _imageStorageService.GetImageUrlAsync(fileName);

            return Ok(new
            {
                success = true,
                fileName = fileName,
                imageUrl = imageUrl,
                message = "Image uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image for product {ProductId}", productId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpPost("upload-multiple/{productId}")]
    public async Task<IActionResult> UploadMultipleImages(string productId, List<IFormFile> files)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(productId))
                return BadRequest("Product ID is required");

            if (files == null || !files.Any())
                return BadRequest("No files uploaded");

            if (files.Count > 10)
                return BadRequest("Maximum 10 images allowed per upload");

            var fileNames = await _imageStorageService.UploadMultipleImagesAsync(files, productId);
            var imageUrls = new List<object>();

            foreach (var fileName in fileNames)
            {
                var imageUrl = await _imageStorageService.GetImageUrlAsync(fileName);
                imageUrls.Add(new { fileName = fileName, imageUrl = imageUrl });
            }

            return Ok(new
            {
                success = true,
                images = imageUrls,
                count = imageUrls.Count,
                message = $"{imageUrls.Count} images uploaded successfully"
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading multiple images for product {ProductId}", productId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpGet("{productId}/images")]
    public async Task<IActionResult> GetProductImages(string productId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(productId))
                return BadRequest("Product ID is required");

            var fileNames = await _imageStorageService.GetProductImagesAsync(productId);
            var images = new List<object>();

            foreach (var fileName in fileNames)
            {
                var imageUrl = await _imageStorageService.GetImageUrlAsync(fileName);
                images.Add(new { fileName = fileName, imageUrl = imageUrl });
            }

            return Ok(new
            {
                success = true,
                productId = productId,
                images = images,
                count = images.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting images for product {ProductId}", productId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpDelete("{productId}/images/{fileName}")]
    public async Task<IActionResult> DeleteImage(string productId, string fileName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(productId) || string.IsNullOrWhiteSpace(fileName))
                return BadRequest("Product ID and file name are required");

            // Construct full file path
            var fullFileName = fileName.Contains('/') ? fileName : $"{productId}/{fileName}";

            var deleted = await _imageStorageService.DeleteImageAsync(fullFileName);

            if (deleted)
            {
                return Ok(new
                {
                    success = true,
                    message = "Image deleted successfully"
                });
            }
            else
            {
                return NotFound(new
                {
                    success = false,
                    message = "Image not found or could not be deleted"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image {FileName} for product {ProductId}", fileName, productId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }

    [HttpGet("image-url/{productId}/{fileName}")]
    public async Task<IActionResult> GetImageUrl(string productId, string fileName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(productId) || string.IsNullOrWhiteSpace(fileName))
                return BadRequest("Product ID and file name are required");

            // Construct full file path
            var fullFileName = fileName.Contains('/') ? fileName : $"{productId}/{fileName}";

            var imageUrl = await _imageStorageService.GetImageUrlAsync(fullFileName);

            return Ok(new
            {
                success = true,
                fileName = fullFileName,
                imageUrl = imageUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting image URL for {FileName} in product {ProductId}", fileName, productId);
            return StatusCode(500, new { success = false, message = "Internal server error" });
        }
    }
}