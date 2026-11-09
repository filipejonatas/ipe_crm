interface PlacaProps {
  placa: string;
}

export function Placa({ placa }: PlacaProps) {
  const texto = placa.toUpperCase();

  return (
    <span aria-label={`Placa ${texto}`} className="placa" role="img">
      <span aria-hidden="true" className="placa-faixa">
        BRASIL
      </span>
      <span aria-hidden="true" className="placa-numero">
        {texto}
      </span>
    </span>
  );
}
