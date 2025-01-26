"use client";

import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-number-input/input";
import { useQuery } from "@tanstack/react-query";
import { User, UserSchema } from "@/types/user";

const Profile = () => {
  const { data } = useQuery<User>({
    queryKey: ["user"],
    queryFn: async () => {
      const response = await fetch("/api/user");
      const user = await response.json();
      return UserSchema.parse(user);
    },
  });
  const [firstName, setFirstName] = useState<string>("");
  const [phone, setPhone] = useState<string | undefined>("");

  useEffect(() => {
    if (data) {
      setFirstName(data.name);
      setPhone(data.phone);
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetch("/api/user", {
      method: "POST",
      body: JSON.stringify({ name: firstName, phone }),
    });
    // TODO:  Better error handling
  };

  return (
    <div className="text-gray-700 max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Contact Information
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="firstName"
            className="block text-gray-700 font-bold mb-2"
          >
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
            }}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-300"
            placeholder="Enter your first name"
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="phoneNumber"
            className="block text-gray-700 font-bold mb-2"
          >
            Phone Number
          </label>
          <PhoneInput country="US" value={phone} onChange={setPhone} />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600
          transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default Profile;
