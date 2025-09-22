using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http; // for HttpContext.Session
using Aroundtheway.Api.Data;     // AppDbContext from Program.cs
using Aroundtheway.Api.Models;
using Aroundtheway.Api.ViewModels.Post;

namespace Aroundtheway.Api.Controllers
{
    // All routes under /posts/...
    [Route("posts")]
    public class PostController : Controller
    {
        private readonly AppDbContext _db;
        private const string SessionUserIdKey = "SessionUserId";

        public PostController(AppDbContext db)
        {
            _db = db;
        }

        // GET /posts/new
        [HttpGet("new")]
        public IActionResult NewPostForm()
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int) return Unauthorized();

            return View(new PostFormViewModel());
        }

        // POST /posts/create
        [HttpPost("create")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreatePost(PostFormViewModel vm)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            // normalize
            vm.ProductName = (vm.ProductName ?? "").Trim();
            vm.Color = (vm.Color ?? "").Trim();

            if (!ModelState.IsValid) return View("NewPostForm", vm);

            // parse numeric fields coming as strings from the VM
            double.TryParse(vm.Price, out var price);
            int.TryParse(vm.NumOfSmall, out var s);
            int.TryParse(vm.NumOfMedium, out var m);
            int.TryParse(vm.NumOfLarge, out var l);
            int.TryParse(vm.NumOfXLarge, out var xl);

            var post = new Post
            {
                ProductName = vm.ProductName,
                Color = vm.Color,
                Price = price,
                NumOfSmall = s,
                NumOfMedium = m,
                NumOfLarge = l,
                NumOfXLarge = xl,
                ImageUrls = vm.ImageUrls ?? new List<string>(),
                UserId = uid
            };

            await _db.Posts.AddAsync(post);
            await _db.SaveChangesAsync();

            return RedirectToAction(nameof(PostDetails), new { id = post.Id });
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

            var post = await _db.Posts.AsNoTracking().FirstOrDefaultAsync(p => p.Id == id);
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
                ImageUrls = post.ImageUrls ?? new List<string>()
            };

            return View(vm);
        }

        // POST /posts/{id}/update
        [HttpPost("{id:int}/update")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdatePost(int id, PostFormViewModel vm)
        {
            var userId = HttpContext.Session.GetInt32(SessionUserIdKey);
            if (userId is not int uid) return Unauthorized();

            if (!ModelState.IsValid) return View(nameof(EditPostForm), vm);

            var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id);
            if (post is null) return NotFound();
            if (post.UserId != uid) return Forbid();

            vm.ProductName = (vm.ProductName ?? "").Trim();
            vm.Color = (vm.Color ?? "").Trim();

            // parse with fallbacks to keep previous values if parse fails
            if (double.TryParse(vm.Price, out var price)) post.Price = price;
            if (int.TryParse(vm.NumOfSmall, out var s)) post.NumOfSmall = s;
            if (int.TryParse(vm.NumOfMedium, out var m)) post.NumOfMedium = m;
            if (int.TryParse(vm.NumOfLarge, out var l)) post.NumOfLarge = l;
            if (int.TryParse(vm.NumOfXLarge, out var xl)) post.NumOfXLarge = xl;

            post.ProductName = vm.ProductName;
            post.Color = vm.Color;
            post.ImageUrls = vm.ImageUrls ?? new List<string>();
            post.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return RedirectToAction(nameof(PostDetails), new { id });
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

        // optional: simple list page route (/posts)
        [HttpGet("")]
        public async Task<IActionResult> PostIndex()
        {
            var posts = await _db.Posts.AsNoTracking().OrderByDescending(p => p.UpdatedAt).ToListAsync();
            return View(posts);
        }
    }
}
