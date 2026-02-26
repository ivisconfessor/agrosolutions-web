using AgroSolutions.Sensores.Dominio;
using AgroSolutions.Sensores.Infra;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AgroSolutions.Sensores.Api",
        Version = "v1",
        Description = "[HACKATON FIAP] Microserviço de ingestão de dados de sensores de campo (umidade, temperatura, precipitação) por talhão."
    });
});

builder.Services.AddSensoresInfra(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "[HACKATON FIAP] - AgroSolutions.Sensores.Api v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

// Ingestão de leitura de sensores (simulada)
app.MapPost("/leituras", async (InserirLeituraRequest request, ILeituraSensorRepository repo, IRabbitMqPublicador rabbit, CancellationToken ct) =>
{
    if (request.IdTalhao == Guid.Empty)
        return Results.BadRequest(new { mensagem = "Id do talhão é obrigatório." });

    var dataLeitura = request.DataLeitura ?? DateTimeOffset.UtcNow;
    var leitura = new LeituraSensor
    {
        IdTalhao = request.IdTalhao,
        DataLeitura = dataLeitura,
        UmidadeSolo = request.UmidadeSolo,
        Temperatura = request.Temperatura,
        Precipitacao = request.Precipitacao
    };

    var id = await repo.InserirAsync(leitura, ct);
    leitura.Id = id;

    try
    {
        rabbit.PublicarLeituraIngerida(new
        {
            id,
            idTalhao = leitura.IdTalhao,
            dataLeitura = leitura.DataLeitura,
            umidadeSolo = leitura.UmidadeSolo,
            temperatura = leitura.Temperatura,
            precipitacao = leitura.Precipitacao
        }, ct);
    }
    catch
    {
        // Log e continua; leitura já persistida. Outros microsserviços podem reprocessar depois.
    }

    var response = new LeituraResponse(leitura.Id, leitura.IdTalhao, leitura.DataLeitura, leitura.UmidadeSolo, leitura.Temperatura, leitura.Precipitacao);
    return Results.Created($"/leituras/{leitura.Id}", response);
})
.WithName("InserirLeitura")
.WithOpenApi();

app.MapGet("/leituras/{id}", async (string id, ILeituraSensorRepository repo, CancellationToken ct) =>
{
    var leitura = await repo.ObterPorIdAsync(id, ct);
    if (leitura is null)
        return Results.NotFound();
    return Results.Ok(new LeituraResponse(leitura.Id, leitura.IdTalhao, leitura.DataLeitura, leitura.UmidadeSolo, leitura.Temperatura, leitura.Precipitacao));
})
.WithName("ObterLeituraPorId")
.WithOpenApi();

app.MapGet("/leituras", async (Guid? idTalhao, DateTimeOffset? de, DateTimeOffset? ate, int? limite, ILeituraSensorRepository repo, CancellationToken ct) =>
{
    if (!idTalhao.HasValue || idTalhao.Value == Guid.Empty)
        return Results.BadRequest(new { mensagem = "Informe idTalhao para listar leituras." });

    var leituras = await repo.ListarPorTalhaoAsync(idTalhao.Value, de, ate, limite ?? 100, ct);
    var response = leituras.Select(l => new LeituraResponse(l.Id, l.IdTalhao, l.DataLeitura, l.UmidadeSolo, l.Temperatura, l.Precipitacao));
    return Results.Ok(response);
})
.WithName("ListarLeiturasPorTalhao")
.WithOpenApi();

app.Run();

record InserirLeituraRequest(Guid IdTalhao, DateTimeOffset? DataLeitura, double UmidadeSolo, double Temperatura, double Precipitacao);
record LeituraResponse(string Id, Guid IdTalhao, DateTimeOffset DataLeitura, double UmidadeSolo, double Temperatura, double Precipitacao);
