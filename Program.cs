using Microsoft.EntityFrameworkCore;
using Control_de_viajes.Data;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// 1. CONFIGURACIÓN DE LÍMITES DE TAMAÑO (Evita errores de conexión al subir fotos pesadas)
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = 100 * 1024 * 1024; // 100MB
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 100 * 1024 * 1024; // 100MB
});

// 2. BASE DE DATOS (PostgreSQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. CORS (Configurado para permitir cualquier origen en producción/desarrollo)
builder.Services.AddCors(options =>
{
    options.AddPolicy("PermitirReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. CONFIGURACIÓN DE CARPETAS Y ARCHIVOS ESTÁTICOS
// Definimos la ruta dentro de wwwroot para que sea accesible públicamente
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");

// Crear la carpeta si no existe
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Permitir servir archivos estáticos (wwwroot es la carpeta por defecto)
app.UseStaticFiles();

// 5. MIDDLEWARES
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    // En Render/Producción también solemos habilitar Swagger para pruebas rápidas
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// El orden de CORS es importante: después de Routing y antes de Authorization
app.UseCors("PermitirReact");

app.UseAuthorization();

app.MapControllers();

app.Run();