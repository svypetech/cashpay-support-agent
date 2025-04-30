"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ConfirmModal from "@/components/ui/ConfirmModal";

// Define the form schema with Zod
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ChangePasswordPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = () => {
    setShowConfirmation(true);
  };

  const handleConfirmChange = async () => {
    setIsSubmitting(true);
    try {
      // Get the form values
      const formData = getValues();

      // Simulate API call to change password
      console.log("Changing password with:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success message or redirect
      alert("Password changed successfully!");

      // Reset form or redirect
      window.location.href = "/settings";
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-2">Change Password</h1>
        <p className="text-gray-600 text-center mb-6">
          Please enter your new Password to reset your password.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Password
            </label>
            
            <input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              className={`w-full px-3 py-2 rounded-md focus:outline-none ${
                errors.currentPassword
                  ? "border-[1px] border-red-500"
                  : "border border-gray-300"
              }`}
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              className={`w-full px-3 py-2 border ${
                errors.newPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500`}
              placeholder="••••••••"
            />
            {errors.newPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              className={`w-full px-3 py-2 border ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-md mt-4"
          >
            Change Password
          </button>
        </form>
      </div>

      {/* Using our reusable ConfirmModal */}
      <ConfirmModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmChange}
        title="Confirm Password Change"
        message="Are you sure you want to change your password?"
        cancelText="Cancel"
        confirmText={isSubmitting ? "Changing..." : "Confirm Change"}
        cancelButtonClass="flex-1 py-2 rounded-lg border-[1px] border-primary text-primary font-medium cursor-pointer flex items-center justify-center"
        confirmButtonClass={`flex-1 py-2 rounded-lg bg-primary text-white font-medium hover:bg-blue-900 flex items-center justify-center cursor-pointer ${
          isSubmitting ? "opacity-70 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
