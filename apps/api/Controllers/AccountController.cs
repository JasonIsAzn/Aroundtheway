using Aroundtheway.Api.Data;
using Aroundtheway.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Aroundtheway.Api.Controllers;


[Route("account")]
public class AccountController : Controller
{
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public AccountController(AppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

}





