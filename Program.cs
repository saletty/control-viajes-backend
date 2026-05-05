using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Data;
using Microsoft.Extensions.FileProviders; // <--- AGREGAR ESTO

var builder = WebApplication.CreateBuilder(args);

// DB
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS ---

// 1. Esto sirve archivos de la carpeta wwwroot (estándar)
app.UseStaticFiles();

// 2. Esto sirve archivos de tu carpeta personalizada "uploads"
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");

// Crear la carpeta si no existe para evitar errores al arrancar
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

// --- RESTO DEL MIDDLEWARE ---

app.UseHttpsRedirection();
app.UseCors("PermitirReact");

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthorization();
app.MapControllers();

app.Run();