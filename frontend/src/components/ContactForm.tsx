import React, { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

type FormData = {
  access_key: string;
  subject: string;
  from_name: string;
  botcheck: string;
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitSuccessful, isSubmitting },
  } = useForm<FormData>({
    mode: "onTouched",
  });

  const [isSuccess, setIsSuccess] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const userName = useWatch({
    control,
    name: "name",
    defaultValue: "Someone",
  });

  useEffect(() => {
    setValue("subject", `${userName} sent a message from Website`);
  }, [userName, setValue]);

  const onSubmit = async (data: FormData, e: any) => {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    })
      .then(async (response) => {
        let json = await response.json();
        if (json.success) {
          setIsSuccess(true);
          setMessage(json.message);
          e.target.reset();
          reset();
        } else {
          setIsSuccess(false);
          setMessage(json.message || "Something went wrong!");
        }
      })
      .catch((error) => {
        setIsSuccess(false);
        setMessage("Client Error. Please check the console.");
        console.log(error);
      });
  };

  return (
    <>
      <div className="w-full  my-5 border border-gray-100 rounded-md py-7">
        {!isSubmitSuccessful && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="hidden"
              value="1aab92dc-a0b9-4043-a390-b72203d93691"
              {...register("access_key")}
            />
            <input type="hidden" {...register("subject")} />
            <input
              type="hidden"
              value="Mission Control"
              {...register("from_name")}
            />
            <input
              type="checkbox"
              className="hidden"
              style={{ display: "none" }}
              {...register("botcheck")}
            />

            {/* Full Name */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Full Name"
                className={`w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
                  errors.name
                    ? "border-red-600 focus:border-red-600 ring-red-100"
                    : "border-gray-300 focus:border-indigo-600 ring-indigo-100"
                }`}
                {...register("name", {
                  required: "Full name is required",
                  maxLength: 80,
                })}
              />
              {errors.name && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-5">
              <input
                type="email"
                placeholder="Email Address"
                className={`w-full px-4 py-3 border-2 rounded-md outline-none focus:ring-4 ${
                  errors.email
                    ? "border-red-600 focus:border-red-600 ring-red-100"
                    : "border-gray-300 focus:border-indigo-600 ring-indigo-100"
                }`}
                {...register("email", {
                  required: "Enter your email",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Please enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-5">
              <textarea
                placeholder="Your Message"
                className={`w-full px-4 py-3 border-2 h-36 rounded-md outline-none focus:ring-4 ${
                  errors.message
                    ? "border-red-600 focus:border-red-600 ring-red-100"
                    : "border-gray-300 focus:border-indigo-600 ring-indigo-100"
                }`}
                {...register("message", {
                  required: "Enter your message",
                })}
              />
              {errors.message && (
                <p className="mt-1 text-red-600 text-sm">
                  {errors.message.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-indigo-200">
              {isSubmitting ? (
                <svg
                  className="w-5 h-5 mx-auto text-white animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                "Send Message"
              )}
            </button>
          </form>
        )}

        {/* Success Message */}
        {isSubmitSuccessful && isSuccess && (
          <div className="text-center text-green-600">
            <h3 className="text-2xl font-semibold mb-2">Success</h3>
            <p>{message}</p>
            <button
              className="mt-4 text-indigo-600 underline"
              onClick={() => reset()}>
              Send another message
            </button>
          </div>
        )}

        {/* Error Message */}
        {isSubmitSuccessful && !isSuccess && (
          <div className="text-center text-red-500">
            <h3 className="text-2xl font-semibold mb-2">Oops, Something went wrong!</h3>
            <p>{message}</p>
            <button
              className="mt-4 text-indigo-600 underline"
              onClick={() => reset()}>
              Try Again
            </button>
          </div>
        )}
      </div>

    </>
  );
}
