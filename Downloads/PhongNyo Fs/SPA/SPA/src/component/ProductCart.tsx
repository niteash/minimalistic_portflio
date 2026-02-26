import { useState } from "react";

type ProductType = {
  id: number;
  name: String;
  price: number;
  image: String;
};

const ProductCart = ({ id, name, price, image }: ProductType) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const handlerImageLoader = () => {
    setImageLoaded(true);
  };
  return (
    <div className="">
      <div className="rounded-lg shadow-lg bg-white p-4">
        <div className="w-full h-48 relative">
          {!imageLoaded && (
            <div className="animate-pulse inset-0 absolute rounded-md bg-gray-200"></div>
          )}
          <img
            src={image}
            className={`h-full w-full rounded-md object-contain 
              transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } `}
            alt={name}
            onLoad={handlerImageLoader}
          ></img>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-zinc-950">
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-gray-600 ">${price}</p>
          </div>

          <button className="px-4 py-2 md:p-3 hover:bg-zinc-500 rounded-lg bg-zinc-950">
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCart;
