using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Aroundtheway.Api.Services;

namespace Aroundtheway.Api.Controllers;

[ApiController]
[Route("api/images")]
public class ProductImageController : ControllerBase
{
    private readonly IImageStorageService _storage;

    public ProductImageController(IImageStorageService storage)
    {
        _storage = storage;
    }

    [HttpPost("upload/{productId}")]
    public async Task<IActionResult> Upload(string productId, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        try
        {
            var fileName = await _storage.UploadImageAsync(file, productId);
            var url = await _storage.GetImageUrlAsync(fileName);
            return Ok(new { fileName, url });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception here
            return StatusCode(500, new { message = "Failed to upload image" });
        }
    }

    [HttpPost("upload/{productId}/multiple")]
    public async Task<IActionResult> UploadMultiple(string productId, [FromForm] List<IFormFile> files)
    {
        if (files == null || !files.Any())
            return BadRequest(new { message = "No files uploaded" });

        try
        {
            var fileNames = await _storage.UploadMultipleImagesAsync(files, productId);
            var urls = await Task.WhenAll(fileNames.Select(fn => _storage.GetImageUrlAsync(fn)));
            
            return Ok(new { fileNames, urls });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            // Log the exception here
            return StatusCode(500, new { message = "Failed to upload images" });
        }
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetProductImages(string productId)
    {
        try
        {
            var fileNames = await _storage.GetProductImagesAsync(productId);
            var urls = await Task.WhenAll(fileNames.Select(fn => _storage.GetImageUrlAsync(fn)));
            
            return Ok(new { fileNames, urls });
        }
        catch (Exception ex)
        {
            // Log the exception here
            return StatusCode(500, new { message = "Failed to retrieve images" });
        }
    }

    [HttpDelete("{fileName}")]
    public async Task<IActionResult> DeleteImage(string fileName)
    {
        try
        {
            var success = await _storage.DeleteImageAsync(fileName);
            if (!success)
                return NotFound(new { message = "Image not found" });
                
            return Ok(new { message = "Image deleted successfully" });
        }
        catch (Exception ex)
        {
            // Log the exception here
            return StatusCode(500, new { message = "Failed to delete image" });
        }
    }
}