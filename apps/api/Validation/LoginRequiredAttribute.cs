
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Aroundtheway.Api.Validation;

public class LoginRequiredAttribute : Attribute, IAuthorizationFilter
{
    private const string SessionUserId = "SessionUserId";

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        var userId = context.HttpContext.Session.GetInt32(SessionUserId);

        if (userId is null)
        {
            context.Result = new RedirectToActionResult(
                "Login",
                "Account",
                new { error = "not-authenticated" }
            );
        }
    }
}
