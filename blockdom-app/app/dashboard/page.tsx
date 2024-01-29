"use client"
import { shortenAddress } from "@/lib/utils";
import LogoutIcon from "@/svg/logoutIcon";
import ProfileIcon from "@/svg/profileIcon";
import { useAddress } from "@thirdweb-dev/react";
import React, { useState,ChangeEvent, FormEvent } from "react";

export default function Dashboard() {
    const [formData, setFormData] = useState({
        name: '',
        walletAddress: '',
        email: '',
      });
      const address = useAddress()
    
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add your form submission logic here
    console.log('Form submitted:', formData);
  };

  return (
    <main className=" overflow-hidden w-screen h-screen relative">
      <section className="flex gap-10 flex-col md:flex-row absolute z-10 h-[70dvh] lg:h-[80dvh] w-[90%]  battleLogWindowBg -translate-x-1/2 left-1/2 top-[8rem] rounded-md p-10">
        <div className=" flex md:flex-col gap-4 flex-row">
          <button className="px-5 py-2 settingsButton hover:bg-white/10 transition-all flex flex-row items-center gap-3">
            Setting <ProfileIcon />
          </button>
          <button className="px-5 py-2 logOutButton hover:brightness-125 transition-all flex flex-row items-center gap-3">
            Log out <LogoutIcon />
          </button>
        </div>
        <div className=" flex flex-col  gap-10">
          <div className=" flex flex-row gap-8 items-center">
            {" "}
            <div className=" rounded-full h-[6.5rem] w-[6.5rem] bg-white/10"></div>
            <button className="greenButton"> Select profile image</button>
          </div>
          <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className=" text-white text-sm ">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2  rounded-lg focus:outline-none text-white/70 text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="walletAddress" className=" text-white text-sm ">
            Wallet Address:
          </label>
          <input
             defaultValue={address}
             placeholder={shortenAddress(address|| "") }
            type="text"
            id="walletAddress"
            name="walletAddress"
            value={formData.walletAddress}
            onChange={handleChange}
            className="w-full px-3 py-2  rounded-lg focus:outline-none text-white/70 text-sm"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className=" text-white text-sm ">
            Email:
          </label>
          <input
       
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2  rounded-lg focus:outline-none text-white/70 text-sm"
            required

          />
        </div>
        <button
        disabled
          type="submit"
          className="greenButton ml-auto flex !py-2"
        >
          Verify
        </button>
      </form>
          </div>
        </div>
      </section>
    </main>
  );
}
