namespace AgroSolutions.Propriedade.Dominio;

public class Propriedade
{
    public Guid IdPropriedade { get; set; }
    public Guid IdProdutor { get; set; }
    public string Nome { get; set; } = null!;
    public string? Descricao { get; set; }
    public DateTimeOffset CriadoEm { get; set; }
    public DateTimeOffset? AtualizadoEm { get; set; }

    public ICollection<Talhao> Talhoes { get; set; } = new List<Talhao>();
}

public class Talhao
{
    public Guid IdTalhao { get; set; }
    public Guid IdPropriedade { get; set; }
    public string Nome { get; set; } = null!;
    public string Cultura { get; set; } = null!;
    public decimal AreaHectares { get; set; }
    public DateTimeOffset CriadoEm { get; set; }
    public DateTimeOffset? AtualizadoEm { get; set; }

    public Propriedade? Propriedade { get; set; }
}
