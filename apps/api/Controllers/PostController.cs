using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.ViewModels.Post;
using System.Text.RegularExpressions;
using Aroundtheway.Api.Services;
using Microsoft.AspNetCore.Authorization;

namespace Aroundtheway.Api.Controllers
{
    // All routes under /posts/...
    [Route("posts")]
    public class PostController : Controller
    {
        private readonly AppDbContext _db;
        private readonly IImageStorageService _imageStorageService;
        private const string SessionUserIdKey = "SessionUserId";


        public PostController(AppDbContext db, IImageStorageService imageStorageService)
        {
            _db = db;
            _imageStorageService = imageStorageService;
        }

        // GET /posts/new
        [HttpGet("new")]
        public IActionResult NewPostForm()
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int) return Unauthorized();

            return View(new PostFormViewModel());
        }

        [HttpPost("create")]
        [ValidateAntiForgeryToken]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> CreatePost([FromForm] PostFormViewModel vm)
        {
            var sessionUserId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (sessionUserId is not int uid) return Unauthorized();

            vm.ProductName = (vm.ProductName ?? "").Trim();
            vm.Color = (vm.Color ?? "").Trim();

            // We populate ImageUrls after upload; remove it from model validation
            ModelState.Remove(nameof(vm.ImageUrls));

            var hasFiles = vm.Images?.Any(f => f is { Length: > 0 }) == true;
            var hasUrls = vm.ImageUrls?.Any(u => !string.IsNullOrWhiteSpace(u)) == true;
            if (!hasFiles && !hasUrls)
                ModelState.AddModelError("Images", "Please select at least one image.");

            if (!ModelState.IsValid) return View("NewPostForm", vm);

            // Parse numeric strings
            double.TryParse(vm.Price, out var price);
            int.TryParse(vm.NumOfSmall, out var s);
            int.TryParse(vm.NumOfMedium, out var m);
            int.TryParse(vm.NumOfLarge, out var l);
            int.TryParse(vm.NumOfXLarge, out var xl);

            // Files from binder
            var files = vm.Images?.Where(f => f is { Length: > 0 }).ToList() ?? new List<IFormFile>();
            if (files.Count > 10)
            {
                ModelState.AddModelError("Images", "You can upload at most 10 images.");
                return View("NewPostForm", vm);
            }
            if (files.Any(f => !f.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError("Images", "All files must be images.");
                return View("NewPostForm", vm);
            }

            // Slug + uniqueness
            var productId = GenerateProductId(vm.ProductName, files.FirstOrDefault()?.FileName);
            productId = await EnsureUniqueProductIdAsync(productId);

            // Upload
            var uploadedUrls = new List<string>();
            if (files.Count > 0)
            {
                var results = await _imageStorageService.UploadMultipleImagesAsync(files, productId);
                foreach (var item in results)
                {
                    uploadedUrls.Add(
                        Uri.IsWellFormedUriString(item, UriKind.Absolute)
                            ? item
                            : await _imageStorageService.GetImageUrlAsync(item)
                    );
                }
            }

            var allUrls = (vm.ImageUrls ?? new List<string>())
                          .Concat(uploadedUrls)
                          .Distinct()
                          .ToList();

            var post = new Post
            {
                ProductName = vm.ProductName,
                Color = vm.Color,
                Price = price,
                NumOfSmall = s,
                NumOfMedium = m,
                NumOfLarge = l,
                NumOfXLarge = xl,
                ImageUrls = allUrls,
                UserId = uid,
                ProductId = productId
            };

            await _db.Posts.AddAsync(post);
            await _db.SaveChangesAsync();

            return RedirectToAction(nameof(PostIndex));
        }


        // GET /posts/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> PostDetails(int id)
        {
            var post = await _db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            return View(post); // or map to a details VM
        }

        // GET /posts/{id}/edit
        [HttpGet("{id:int}/edit")]
        public async Task<IActionResult> EditPostForm(int id)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            if (post.UserId != uid) return Forbid();

            var vm = new PostFormViewModel
            {
                ProductName = post.ProductName,
                Color = post.Color,
                Price = post.Price.ToString(),
                NumOfSmall = post.NumOfSmall.ToString(),
                NumOfMedium = post.NumOfMedium.ToString(),
                NumOfLarge = post.NumOfLarge.ToString(),
                NumOfXLarge = post.NumOfXLarge.ToString(),
                ImageUrls = post.ImageUrls
            };

            ViewBag.PostId = id;
            return View("EditPostForm", vm);
        }


        // POST /posts/{id}/update
        [HttpPost("{id:int}/update")]
        [ValidateAntiForgeryToken]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UpdatePost(int id, [FromForm] PostFormViewModel vm)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            if (post.UserId != uid) return Forbid();

            vm.ProductName = (vm.ProductName ?? "").Trim();
            vm.Color = (vm.Color ?? "").Trim();

            ModelState.Remove(nameof(vm.ImageUrls));
            if (!ModelState.IsValid) { ViewBag.PostId = id; return View("EditPostForm", vm); }


            if (double.TryParse(vm.Price, out var price)) post.Price = price;
            if (int.TryParse(vm.NumOfSmall, out var s)) post.NumOfSmall = s;
            if (int.TryParse(vm.NumOfMedium, out var m)) post.NumOfMedium = m;
            if (int.TryParse(vm.NumOfLarge, out var l)) post.NumOfLarge = l;
            if (int.TryParse(vm.NumOfXLarge, out var xl)) post.NumOfXLarge = xl;

            post.ProductName = vm.ProductName;
            post.Color = vm.Color;


            var removeSet = Request.Form["ImageUrlsToRemove"].ToHashSet(StringComparer.OrdinalIgnoreCase);
            var remainingUrls = (post.ImageUrls ?? [])
                .Where(u => !removeSet.Contains(u))
                .ToList();

            // upload any new images (keep existing productId)
            var files = vm.Images?.Where(f => f is { Length: > 0 }).ToList() ?? new List<IFormFile>();
            if (files.Count > 10)
            {
                ModelState.AddModelError("Images", "You can upload at most 10 images.");
                ViewBag.PostId = id; return View("EditPostForm", vm);
            }
            if (files.Any(f => !f.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase)))
            {
                ModelState.AddModelError("Images", "All files must be images.");
                ViewBag.PostId = id; return View("EditPostForm", vm);
            }

            var uploadedUrls = new List<string>();
            if (files.Count > 0)
            {
                var results = await _imageStorageService.UploadMultipleImagesAsync(files, post.ProductId);
                foreach (var item in results)
                {
                    uploadedUrls.Add(
                        Uri.IsWellFormedUriString(item, UriKind.Absolute)
                            ? item
                            : await _imageStorageService.GetImageUrlAsync(item)
                    );
                }
            }

            post.ImageUrls = remainingUrls.Concat(uploadedUrls).Distinct().ToList();
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return RedirectToAction(nameof(PostIndex));
        }

        // GET /posts/{id}/delete
        [HttpGet("{id:int}/delete")]
        public async Task<IActionResult> ConfirmDelete(int id)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            var post = await _db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            if (post.UserId != uid) return Forbid();

            var vm = new ConfirmDeleteViewModel { Id = post.Id, ProductName = post.ProductName };
            return View("ConfirmDelete", vm);
        }

        // POST /posts/{id}/destroy
        [HttpPost("{id:int}/destroy")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeletePost(int id)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            if (post.UserId != uid) return Forbid();

            _db.Posts.Remove(post);
            await _db.SaveChangesAsync();

            // Send them somewhere that exists in your app (adjust as needed)
            return RedirectToAction(nameof(PostIndex));
        }

        // GET /posts
        [HttpGet("")]
        public async Task<IActionResult> PostIndex()
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int) return Unauthorized();

            var raw = await _db.Posts
                .AsNoTracking()
                .Select(p => new
                {
                    p.Id,
                    p.ProductName,
                    p.ImageUrls
                })
                .ToListAsync();

            var vm = raw.Select(p => new PostRowViewModel
            {
                Id = p.Id,
                ProductName = p.ProductName,
                FirstImageUrl = (p.ImageUrls != null && p.ImageUrls.Count > 0) ? p.ImageUrls[0] : null,
                ImageCount = p.ImageUrls?.Count ?? 0
            })
            .ToList();

            return View(vm);
        }



        // ---------- helpers for productId slugging ----------

        private async Task<string> EnsureUniqueProductIdAsync(string baseId)
        {
            var candidate = baseId;
            var tries = 0;
            while (await _db.Posts.AsNoTracking().AnyAsync(p => p.ProductId == candidate))
            {
                tries++;
                candidate = $"{baseId}-{tries}";
                if (tries > 10)
                {
                    candidate = $"{baseId}-{ShortRandom()}";
                    break;
                }
            }
            return candidate;
        }

        private static string GenerateProductId(string? nameSeed, string? imageFileNameSeed)
        {
            var seed = (nameSeed ?? "").Trim();
            if (string.IsNullOrWhiteSpace(seed) && !string.IsNullOrWhiteSpace(imageFileNameSeed))
                seed = Path.GetFileNameWithoutExtension(imageFileNameSeed);

            if (string.IsNullOrWhiteSpace(seed)) seed = "product";

            seed = seed.ToLowerInvariant();
            seed = Regex.Replace(seed, @"[^a-z0-9]+", "-");
            seed = Regex.Replace(seed, @"-+", "-").Trim('-');
            if (seed.Length > 40) seed = seed[..40].Trim('-');

            return $"{seed}-{ShortRandom()}";
        }

        private static string ShortRandom(int len = 6) => Guid.NewGuid().ToString("N")[..len].ToLowerInvariant();

    }
}