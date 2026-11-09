import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { Icone } from '@/components/Icone';
import { autenticacaoService } from '@/services/autenticacao.service';
import { useAutenticacaoStore } from '@/store/autenticacao.store';

const schema = z.object({
  email: z.string().email('Informe um email valido'),
  senha: z.string().min(8, 'A senha deve ter no minimo 8 caracteres'),
});

type LoginForm = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const salvarLogin = useAutenticacaoStore((state) => state.login);
  const [erro, setErro] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', senha: '' },
  });

  async function onSubmit(dados: LoginForm) {
    setErro(null);

    try {
      const resposta = await autenticacaoService.login(dados.email, dados.senha);
      salvarLogin(resposta.access_token, resposta.usuario);
      navigate('/');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        setErro('Email ou senha invalidos');
        return;
      }

      setErro('Nao foi possivel entrar. Tente novamente.');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-concreto px-4 py-10">
      <section className="painel w-full max-w-sm border-t-4 border-t-ipe p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-grafite">Ipê CRM</h1>
          <p className="mt-2 text-sm text-grafite-500">Entre com seu email e senha da oficina.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="rotulo" htmlFor="email">
              Email
            </label>
            <input
              className="campo mt-2 py-2.5 text-base"
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? <p className="mensagem-erro mt-2">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="rotulo" htmlFor="senha">
              Senha
            </label>
            <div className="relative mt-2">
              <input
                className="campo py-2.5 pr-11 text-base"
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('senha')}
              />
              <button
                aria-label={mostrarSenha ? 'Ocultar' : 'Mostrar'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-grafite-500 transition-colors hover:text-grafite"
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                type="button"
                onClick={() => setMostrarSenha((valor) => !valor)}
              >
                {mostrarSenha ? (
                  <Icone className="h-5 w-5" nome="ocultar" />
                ) : (
                  <Icone className="h-5 w-5" nome="mostrar" />
                )}
              </button>
            </div>
            {errors.senha ? <p className="mensagem-erro mt-2">{errors.senha.message}</p> : null}
          </div>

          {erro ? (
            <p className="rounded-md bg-erro-claro px-3 py-2 text-sm text-erro" role="alert">
              {erro}
            </p>
          ) : null}

          <button
            className="btn-primario w-full py-2.5 text-base"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  );
}
