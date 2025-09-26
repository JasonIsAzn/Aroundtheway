using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using Aroundtheway.Api.Data;
using Aroundtheway.Api.Models;
using Aroundtheway.Api.ViewModels;

namespace Aroundtheway.Api.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class ChatBotController : ControllerBase
{
    private readonly ChatClient _chatClient;
    private readonly ILogger<ChatBotController> _logger;
    private readonly AppDbContext _context;

    public ChatBotController(ChatClient chatClient, ILogger<ChatBotController> logger, AppDbContext context)
    {
        _chatClient = chatClient;
        _logger = logger;
        _context = context;
    }

    private int? CurrentUserId => HttpContext.Session.GetInt32("SessionUserId");
    private bool IsLoggedIn => CurrentUserId.HasValue;

    [HttpPost("message")]
    public async Task<IActionResult> SendMessage([FromBody] ChatMessageRequestViewModel request)
    {
        // Authentication check - disabled for demo
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            // Get backend data for context
            var products = await _context.Posts.AsNoTracking()
                .Select(p => new { p.ProductName, p.Color, p.Price, p.NumOfSmall, p.NumOfMedium, p.NumOfLarge, p.NumOfXLarge })
                .Take(10)
                .ToListAsync();

            var productInfo = products.Any()
                ? "Current products: " + string.Join(", ", products.Select(p => $"{p.ProductName} in {p.Color} ($${p.Price:F2})"))
                : "No products currently in stock.";

            var systemPrompt = "You are a helpful shopping assistant for an e-commerce clothing store called 'Aroundtheway'. " +
                              "Help users find products, answer questions about sizing, materials, shipping, and returns. " +
                              "Be friendly, concise, and focus on helping with shopping decisions. " +
                              $"Here's our current inventory: {productInfo} " +
                              "Sizes available: Small, Medium, Large, XLarge. " +
                              "If asked about specific products, refer to this inventory. " +
                              "If you don't know specific details, suggest they browse the catalog or contact customer service. " +
                              "Use emojis in your responses to make them more engaging.";

            var openAIMessages = new OpenAI.Chat.ChatMessage[]
            {
                new SystemChatMessage(systemPrompt),
                new UserChatMessage(request.Message)
            };

var chatCompletion = await _chatClient.CompleteChatAsync(openAIMessages);
var botResponse = chatCompletion.Value.Choices[0].Message.Content;

            // Save to database if user is logged in
            Models.ChatMessage? chatMessage = null;
            if (IsLoggedIn)
            {
                chatMessage = new Models.ChatMessage
                {
                    UserId = CurrentUserId!.Value,
                    UserMessage = request.Message,
                    BotResponse = botResponse,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ChatMessages.Add(chatMessage);
                await _context.SaveChangesAsync();
            }

            _logger.LogInformation("ChatBot responded to user {UserId}: {Message}", CurrentUserId, request.Message);

            // Return response
            return Ok(new ChatMessageResponseViewModel
            {
                Message = botResponse,
                Timestamp = chatMessage?.CreatedAt ?? DateTime.UtcNow,
                MessageId = chatMessage?.Id
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat message for user {UserId}: {Message}", CurrentUserId, request.Message);
            return StatusCode(500, new { error = "Sorry, I'm having trouble right now. Please try again later." });
        }
    }

    [HttpGet("history")]
    public async Task<IActionResult> GetChatHistory()
    {
        if (!IsLoggedIn)
        {
            return Unauthorized(new { error = "Please log in to view chat history." });
        }

        try
        {
            var chatHistory = await _context.ChatMessages
                .AsNoTracking()
                .Where(c => c.UserId == CurrentUserId!.Value)
                .OrderBy(c => c.CreatedAt)
                .Take(50) // Limit to last 50 messages
                .Select(c => new ChatMessageResponseViewModel
                {
                    MessageId = c.Id,
                    Message = c.BotResponse,
                    Timestamp = c.CreatedAt
                })
                .ToListAsync();

            return Ok(chatHistory);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching chat history for user {UserId}", CurrentUserId);
            return StatusCode(500, new { error = "Unable to load chat history." });
        }
    }
}
