using CloudinaryDotNet;
using Control_de_viajes.Data;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// 1. LÍMITES DE TAMAÑO
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024;
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024;
});

// 2. BASE DE DATOS
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. CORS (temporal abierto para pruebas)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

//  4. CLOUDINARY (AQUÍ VA, ANTES DEL BUILD)
builder.Services.AddSingleton(new Cloudinary(new Account(
    builder.Configuration["Cloudinary:CloudName"],
    builder.Configuration["Cloudinary:ApiKey"],
    builder.Configuration["Cloudinary:ApiSecret"]
)));

// 5. SERVICIOS
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6. CARPETAS LOCALES (opcional, ya no necesarias si usas Cloudinary)
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");

if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);

// 7. TIPOS DE ARCHIVO
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".webm"] = "audio/webm";
provider.Mappings[".mp3"] = "audio/mpeg";
provider.Mappings[".jpg"] = "image/jpeg";
provider.Mappings[".jpeg"] = "image/jpeg";
provider.Mappings[".png"] = "image/png";

// 8. STATIC FILES (solo por si acaso)
app.UseStaticFiles();

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    ContentTypeProvider = provider,
    ServeUnknownFileTypes = true
});

// 9. MIDDLEWARES
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("PermitirReact");
app.UseAuthorization();

app.MapControllers();

app.Run();