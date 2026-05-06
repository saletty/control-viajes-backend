using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Data;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.AspNetCore.StaticFiles; // <--- AGREGAR ESTO

var builder = WebApplication.CreateBuilder(args);

// 1. LÍMITES DE TAMAÑO (Para fotos de alta resolución y audios)
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100MB
});

// 2. BASE DE DATOS
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("https://control-viajes-frontend.vercel.app")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. CONFIGURACIÓN DE CARPETAS
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");

if (!Directory.Exists(uploadsPath))
    Directory.CreateDirectory(uploadsPath);

// --- TIPOS DE ARCHIVO ---
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".webm"] = "audio/webm";
provider.Mappings[".mp3"] = "audio/mpeg";
provider.Mappings[".jpg"] = "image/jpeg";
provider.Mappings[".jpeg"] = "image/jpeg";
provider.Mappings[".png"] = "image/png";

//  Servir archivos estáticos generales (wwwroot)
app.UseStaticFiles();
//  Servir específicamente la carpeta /uploads
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads",
    ContentTypeProvider = provider,
    ServeUnknownFileTypes = true
});// 5. MIDDLEWARES
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseCors("PermitirReact");
app.UseAuthorization();
app.MapControllers();

app.Run();