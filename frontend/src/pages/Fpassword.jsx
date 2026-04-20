import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPassword } from "@/api/user.api.js";

const fpassSchema = z.object({
  email: z.email("Invalid email address"),
});

export default function Fpassword() {
  const [serverError, setServerError] = useState("");
  const [showmessage, setShowMessage] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(fpassSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");
      const res = await forgotPassword(data);
    //   console.log(res);
      reset();
      setShowMessage(true);
    } catch (error) {
      console.log("error while generating reset password link: ", error);
      setServerError(error.response?.data?.message || "something went wrong");
    }
  };

  return showmessage ? (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full flex flex-col gap-5 max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="text-2xl font-semibold text-center">
          Reset your password
        </h2>
        <p className="text-center text-sm font-extralight">
          Check your email for a link to reset your password. If it does not
          appear within a few minutes, check your spam folder.
        </p>
        <div className="flex justify-center">
          <Link
            to="/login"
            className="text-sm text-emerald-500 hover:text-emerald-400"
          >
            return to sign in
          </Link>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-8 shadow-xl">
        <h2 className="mb-6 text-2xl font-semibold text-center">
          Reset your password
          <p className="text-sm font-light">
            Enter your registered email to get password reset link
          </p>
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-zinc-400">Email</label>
            <input
                type="email"
              {...register("email")}
              className="mt-1 w-full rounded-md border border-white/10 bg-zinc-800 px-3 py-2 outline-none focus:border-emerald-400"
            />
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email.message}</p>
            )}
          </div>

          {serverError && <p className="text-sm text-red-400">{serverError}</p>}
          {/* Submit */}
          <button
            type="submit"
            className="w-full cursor-pointer rounded-md bg-emerald-500 py-2 font-medium text-black transition hover:bg-emerald-400"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
