namespace Aroundtheway.Api.Services;

public interface IImageStorageService
{
    Task<string> UploadImageAsync(IFormFile file, string productId);
    Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files, string productId);
    Task<string> GetImageUrlAsync(string fileName);
    Task<bool> DeleteImageAsync(string fileName);
    Task<List<string>> GetProductImagesAsync(string productId);
}