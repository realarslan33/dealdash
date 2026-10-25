import React from "react";
import { Link } from "react-router-dom";

const DropDown = ({ categoriesData, setDropDown }) => (
  <div className="absolute left-0 top-full z-50 max-h-[70vh] w-[270px] overflow-y-auto rounded-b-md border border-slate-100 bg-white py-2 shadow-lg">
    {categoriesData.map((category) => (
      <Link
        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#3957db]"
        key={category.id}
        onClick={() => setDropDown(false)}
        to={`/products?category=${encodeURIComponent(category.title)}`}
      >
        <img
          alt=""
          className="h-8 w-8 shrink-0 object-contain"
          src={category.image_Url}
        />
        <span>{category.title}</span>
      </Link>
    ))}
  </div>
);

export default DropDown;
