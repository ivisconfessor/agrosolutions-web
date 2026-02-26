using AgroSolutions.Propriedade.Infra;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Serviços
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "AgroSolutions.Propriedade.Api",
        Version = "v1",
        Description = "[HACKATON FIAP] Microserviço responsável pelo cadastro de propriedades rurais e talhões."
    });
});

builder.Services.AddDbContext<PropriedadeDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("ConnectionStrings:DefaultConnection não está configurada.");
    }

    options.UseNpgsql(connectionString);
});

var app = builder.Build();

// Pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "[HACKATON FIAP] - AgroSolutions.Propriedade.Api v1");
        options.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();

app.MapPost("/propriedades", async (CriarPropriedadeRequest request, PropriedadeDbContext db) =>
{
    if (request.IdProdutor == Guid.Empty)
        return Results.BadRequest(new { mensagem = "Id do produtor é obrigatório." });

    if (string.IsNullOrWhiteSpace(request.Nome))
        return Results.BadRequest(new { mensagem = "Nome da propriedade é obrigatório." });

    if (request.Talhoes is null || request.Talhoes.Count == 0)
        return Results.BadRequest(new { mensagem = "Informe ao menos um talhão." });

    var agora = DateTimeOffset.UtcNow;

    var propriedade = new AgroSolutions.Propriedade.Dominio.Propriedade
    {
        IdPropriedade = Guid.NewGuid(),
        IdProdutor = request.IdProdutor,
        Nome = request.Nome.Trim(),
        Descricao = string.IsNullOrWhiteSpace(request.Descricao) ? null : request.Descricao.Trim(),
        CriadoEm = agora,
        Talhoes = request.Talhoes.Select(t => new AgroSolutions.Propriedade.Dominio.Talhao
        {
            IdTalhao = Guid.NewGuid(),
            IdPropriedade = Guid.Empty, // será setado pelo EF via relacionamento
            Nome = t.Nome.Trim(),
            Cultura = t.Cultura.Trim(),
            AreaHectares = t.AreaHectares,
            CriadoEm = agora
        }).ToList()
    };

    await db.Propriedades.AddAsync(propriedade);
    await db.SaveChangesAsync();

    var response = new PropriedadeResponse(
        propriedade.IdPropriedade,
        propriedade.IdProdutor,
        propriedade.Nome,
        propriedade.Descricao,
        propriedade.CriadoEm,
        propriedade.AtualizadoEm,
        propriedade.Talhoes.Select(t => new TalhaoResponse(
            t.IdTalhao,
            t.Nome,
            t.Cultura,
            t.AreaHectares,
            t.CriadoEm,
            t.AtualizadoEm
        )).ToList()
    );

    return Results.Created($"/propriedades/{propriedade.IdPropriedade}", response);
})
.WithName("CriarPropriedade")
.WithOpenApi();

app.MapGet("/propriedades/{id:guid}", async (Guid id, PropriedadeDbContext db) =>
{
    var propriedade = await db.Propriedades
        .Include(p => p.Talhoes)
        .AsNoTracking()
        .SingleOrDefaultAsync(p => p.IdPropriedade == id);

    if (propriedade is null)
        return Results.NotFound();

    var response = new PropriedadeResponse(
        propriedade.IdPropriedade,
        propriedade.IdProdutor,
        propriedade.Nome,
        propriedade.Descricao,
        propriedade.CriadoEm,
        propriedade.AtualizadoEm,
        propriedade.Talhoes.Select(t => new TalhaoResponse(
            t.IdTalhao,
            t.Nome,
            t.Cultura,
            t.AreaHectares,
            t.CriadoEm,
            t.AtualizadoEm
        )).ToList()
    );

    return Results.Ok(response);
})
.WithName("ObterPropriedadePorId")
.WithOpenApi();

app.MapGet("/propriedades", async (Guid? idProdutor, PropriedadeDbContext db) =>
{
    var query = db.Propriedades
        .Include(p => p.Talhoes)
        .AsNoTracking()
        .AsQueryable();

    if (idProdutor.HasValue && idProdutor.Value != Guid.Empty)
    {
        query = query.Where(p => p.IdProdutor == idProdutor.Value);
    }

    var propriedades = await query
        .OrderBy(p => p.Nome)
        .ToListAsync();

    var response = propriedades.Select(p => new PropriedadeResponse(
        p.IdPropriedade,
        p.IdProdutor,
        p.Nome,
        p.Descricao,
        p.CriadoEm,
        p.AtualizadoEm,
        p.Talhoes.Select(t => new TalhaoResponse(
            t.IdTalhao,
            t.Nome,
            t.Cultura,
            t.AreaHectares,
            t.CriadoEm,
            t.AtualizadoEm
        )).ToList()
    ));

    return Results.Ok(response);
})
.WithName("ListarPropriedades")
.WithOpenApi();

app.Run();

record CriarPropriedadeRequest(Guid IdProdutor, string Nome, string? Descricao, List<CriarTalhaoRequest> Talhoes);
record CriarTalhaoRequest(string Nome, string Cultura, decimal AreaHectares);
record PropriedadeResponse(Guid IdPropriedade, Guid IdProdutor, string Nome, string? Descricao, DateTimeOffset CriadoEm, DateTimeOffset? AtualizadoEm, List<TalhaoResponse> Talhoes);
record TalhaoResponse(Guid IdTalhao, string Nome, string Cultura, decimal AreaHectares, DateTimeOffset CriadoEm, DateTimeOffset? AtualizadoEm);
