import UserService from "@/service/UserService";
import { LoginInput } from "@/types";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { mutate } from "swr";

export default function LoginForm() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();

  const login = async (event: { preventDefault: () => void }) => {
    event.preventDefault();

    setIsLoading(true);

    try {
      const loginInput: LoginInput = {
        username,
        password,
      };
      const response = await UserService.login(loginInput);
      if (response && response.ok) {
        const user = await response.json();
        sessionStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            token: user.token,
            id: user.id,
            username: user.username,
            role: user.role,
          }),
        );
        setIsLoading(false);
        mutate("ping");
        console.log("routing");
        router.push("/admin/events?type=Verderstudeerbeurs");
      } else {
        const errorData = await response.json();
        setError(
          "Ongeldige gebruikersnaam of wachtwoord: " + errorData.message,
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setIsLoading(false);

      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    }
  };

  return (
    <form onSubmit={login}>
      <h1>Log in voor de applicatie</h1>
      <div className="mt-8 flex flex-col">
        <label htmlFor="username" className="hidden">
          Gebruikersnaam
        </label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Gebruikersnaam"
          className="rounded border border-gray-300 p-1.5"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="relative mt-2 flex flex-col">
        <label htmlFor="password" className="hidden">
          Wachtwoord
        </label>
        <input
          id="password"
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder="Wachtwoord "
          className="rounded border border-gray-300 p-1.5 pr-10"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-0 right-0 mt-2 mr-3 flex cursor-pointer items-center justify-center text-gray-500 hover:text-gray-700"
          aria-label={showPassword ? "Verberg wachtwoord" : "Toon wachtwoord"}
        >
          {showPassword ? <Eye /> : <EyeOff />}
        </button>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`bg-primary hover:bg-secondary mt-4 w-full cursor-pointer rounded py-2 text-white transition-all ${isLoading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        {isLoading ? "Logging in..." : "Log in"}
      </button>
      {error && <p className="mt-2 text-red-500">{error}</p>}
    </form>
  );
}
