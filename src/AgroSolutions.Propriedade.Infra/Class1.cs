using AgroSolutions.Propriedade.Dominio;
using Microsoft.EntityFrameworkCore;

namespace AgroSolutions.Propriedade.Infra;

public class PropriedadeDbContext : DbContext
{
    public PropriedadeDbContext(DbContextOptions<PropriedadeDbContext> options)
        : base(options)
    {
    }

    public DbSet<AgroSolutions.Propriedade.Dominio.Propriedade> Propriedades => Set<AgroSolutions.Propriedade.Dominio.Propriedade>();
    public DbSet<AgroSolutions.Propriedade.Dominio.Talhao> Talhoes => Set<AgroSolutions.Propriedade.Dominio.Talhao>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        var propriedade = modelBuilder.Entity<AgroSolutions.Propriedade.Dominio.Propriedade>();
        propriedade.ToTable("propriedades");

        propriedade.HasKey(p => p.IdPropriedade)
                   .HasName("pk_propriedades");

        propriedade.Property(p => p.IdPropriedade)
                   .HasColumnName("id_propriedade")
                   .HasColumnType("uuid");

        propriedade.Property(p => p.IdProdutor)
                   .HasColumnName("id_produtor")
                   .HasColumnType("uuid")
                   .IsRequired();

        propriedade.Property(p => p.Nome)
                   .HasColumnName("nome")
                   .HasMaxLength(150)
                   .IsRequired();

        propriedade.Property(p => p.Descricao)
                   .HasColumnName("descricao")
                   .HasMaxLength(500);

        propriedade.Property(p => p.CriadoEm)
                   .HasColumnName("criado_em")
                   .HasColumnType("timestamptz")
                   .IsRequired();

        propriedade.Property(p => p.AtualizadoEm)
                   .HasColumnName("atualizado_em")
                   .HasColumnType("timestamptz");

        propriedade.HasIndex(p => new { p.IdProdutor, p.Nome })
                   .IsUnique()
                   .HasDatabaseName("ux_propriedades_produtor_nome");

        var talhao = modelBuilder.Entity<AgroSolutions.Propriedade.Dominio.Talhao>();
        talhao.ToTable("talhoes");

        talhao.HasKey(t => t.IdTalhao)
              .HasName("pk_talhoes");

        talhao.Property(t => t.IdTalhao)
              .HasColumnName("id_talhao")
              .HasColumnType("uuid");

        talhao.Property(t => t.IdPropriedade)
              .HasColumnName("id_propriedade")
              .HasColumnType("uuid")
              .IsRequired();

        talhao.Property(t => t.Nome)
              .HasColumnName("nome")
              .HasMaxLength(150)
              .IsRequired();

        talhao.Property(t => t.Cultura)
              .HasColumnName("cultura")
              .HasMaxLength(100)
              .IsRequired();

        talhao.Property(t => t.AreaHectares)
              .HasColumnName("area_hectares")
              .HasColumnType("numeric(10,2)")
              .IsRequired();

        talhao.Property(t => t.CriadoEm)
              .HasColumnName("criado_em")
              .HasColumnType("timestamptz")
              .IsRequired();

        talhao.Property(t => t.AtualizadoEm)
              .HasColumnName("atualizado_em")
              .HasColumnType("timestamptz");

        talhao.HasOne(t => t.Propriedade)
              .WithMany(p => p.Talhoes)
              .HasForeignKey(t => t.IdPropriedade)
              .HasConstraintName("fk_talhoes_propriedades")
              .OnDelete(DeleteBehavior.Cascade);

        talhao.HasIndex(t => new { t.IdPropriedade, t.Nome })
              .IsUnique()
              .HasDatabaseName("ux_talhoes_propriedade_nome");
    }
}
