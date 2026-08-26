import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase text-emerald-700">IPE CRM</p>
          <h1 className="mt-2 text-2xl font-semibold text-zinc-950">Entrar</h1>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label className="text-sm font-medium text-zinc-800" htmlFor="email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-2 text-sm text-red-700">{errors.email.message}</p>
            ) : null}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-800" htmlFor="senha">
              Senha
            </label>
            <div className="relative mt-2">
              <input
                className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-11 text-zinc-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('senha')}
              />
              <button
                aria-label={mostrarSenha ? 'Ocultar' : 'Mostrar'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500 transition hover:text-zinc-800"
                title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                type="button"
                onClick={() => setMostrarSenha((valor) => !valor)}
              >
                {mostrarSenha ? (
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10.7 5.1A10.8 10.8 0 0 1 12 5c5 0 8.5 4.1 9.7 5.8a2 2 0 0 1 0 2.4 17.8 17.8 0 0 1-3 3.4" />
                    <path d="M14.1 14.1a3 3 0 0 1-4.2-4.2" />
                    <path d="M3 3l18 18" />
                    <path d="M6.5 6.5a17.2 17.2 0 0 0-4.2 4.3 2 2 0 0 0 0 2.4C3.5 14.9 7 19 12 19a9.6 9.6 0 0 0 3.5-.7" />
                  </svg>
                ) : (
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2.3 10.8a2 2 0 0 0 0 2.4C3.5 14.9 7 19 12 19s8.5-4.1 9.7-5.8a2 2 0 0 0 0-2.4C20.5 9.1 17 5 12 5s-8.5 4.1-9.7 5.8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {errors.senha ? (
              <p className="mt-2 text-sm text-red-700">{errors.senha.message}</p>
            ) : null}
          </div>

          {erro ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{erro}</p>
          ) : null}

          <button
            className="w-full rounded-md bg-emerald-700 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
