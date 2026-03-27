import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const action = isLogin ? login : signup;
        const result = await action(email, password);

        if (!result.success) {
            setError(result.error || "Ocorreu um erro ao processar sua solicitação.");
        }
        setLoading(false);
    };

    return (
        <div className="auth-container">
            <div className="auth-card glass">
                <div className="auth-header">
                    <h1>🚀 InfraStack</h1>
                    <p>{isLogin ? "Bem-vindo de volta!" : "Crie sua conta agora"}</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : isLogin ? (
                            <>
                                <LogIn size={20} /> Entrar
                            </>
                        ) : (
                            <>
                                <UserPlus size={20} /> Cadastrar
                            </>
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={() => setIsLogin(!isLogin)} className="btn-link">
                        {isLogin
                            ? "Não tem uma conta? Cadastre-se"
                            : "Já tem uma conta? Entre agora"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;
