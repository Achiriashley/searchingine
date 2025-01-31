// 'use client'
// import React, { useState } from 'react'
// import axios from 'axios'

// export default function Page() {
//   const [searchQuery, setSearchQuery] = useState(""); // Search query state
//   const [filteredData, setFilteredData] = useState(""); // Store filtered products
//   const [data , setImage] = useState([]); // imageStore


//     // Fetch images
//     const getImages = async () => {
//       try {
//           const results = await axios.get('https://pixabay.com/api/');
//           setImage(results.data);
//           setFilteredData(results.data); // Initialize filtered data
//       } catch (error) {
//           console.error(error);
//       }
//   };

//   const handleSearch = (query) => {
//     setSearchQuery(query);
//     if (query.trim() === "") {
//         setFilteredData(data); // Reset to all products if query is empty
//     } else {
//         const filteredResults = data.filter(product =>
//             product.title.toLowerCase().includes(query.toLowerCase())
//         );
//         setFilteredData(filteredResults);
//     }
// };
//   return (
//     <div className='bg-black h-[100vh]' style={{ backgroundImage: "url('https://cdn.pixabay.com/photo/2022/01/08/16/01/lamp-6924294_640.jpg')"}}>
//     <div className='flex  font-semibold  justify-center  text-white p-4  '>
//       Royalty Free and Free images to download
//     </div>

//     <div className="flex gap-3 items-center justify-center"> 
//               <button className='border rounded-full  border-full bg-white bg-opacity-20 hover:bg-opacity-50 backdrop-blur-md text-gray-400 transition px-2 py-2'>
//                 Images
//               </button>
//               <button className='border rounded-full  border-full bg-white bg-opacity-20 hover:bg-opacity-50 backdrop-blur-md text-gray-400 transition px-2 py-2'>
//                 Videos
//               </button>
//               <button className='border rounded-full  border-full bg-white bg-opacity-20 hover:bg-opacity-50 backdrop-blur-md text-gray-400 transition px-2 py-2'>
//                 Vector
//               </button>
//               <button className='border rounded-full  border-full bg-white bg-opacity-20 hover:bg-opacity-50 backdrop-blur-md text-gray-400 transition px-2 py-2'>
//                 Illustration
//               </button>
              
//             </div>



//     <div className="flex p-5 justify-center my-5 bg-transparent">
//                 <input
//                     type="text"
//                     placeholder="Browse images, videos, illustrations"
//                     value={searchQuery}
//                     onChange={(e) => handleSearch(e.target.value)}
//                     className=" bg-white bg-opacity-50 text-white rounded-full border  px-6 py-2 w-[60%] focus: outline-none border-grey-500 "
//                 />
//             </div>

           


//     </div>
//   )
// }

"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export default function Page() {
  const [searchQuery, setSearchQuery] = useState(""); // Search query state
  const [filteredData, setFilteredData] = useState([]); // Store filtered images
  const [page, setPage] = useState(1); // Track current page
  const [loading, setLoading] = useState(false); // Loading state
  const [category, setCategory] = useState("all"); // Default category
  const [error, setError] = useState(null); // Error state
  const [hasMore, setHasMore] = useState(true); // Track if more data is available

  const API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
  
  // Infinite scroll observer
  const observer = useRef();
  const lastImageRef = useCallback(
    (node) => {
      if (loading) return; // Don't trigger if already loading
      if (observer.current) observer.current.disconnect(); // Disconnect previous observer

      // Create a new observer
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            setPage((prevPage) => prevPage + 1); // Load more images
          }
        },
        { threshold: 1.0 } // Trigger when the entire element is visible
      );

      if (node) observer.current.observe(node); // Observe the last image
    },
    [loading, hasMore]
  );

  // Fetch images from Pixabay API
  useEffect(() => {
    const getImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get("https://pixabay.com/api/", {
          params: {
            key: API_KEY,
            q: searchQuery,
            page: page,
            category: category === "all" ? null : category,
            per_page: 20, // Adjust as needed
          },
        });

        // Check if there are more images
        if (response.data.hits.length === 0) {
          setHasMore(false); // No more images to load
        } else {
          setFilteredData((prevData) => [...prevData, ...response.data.hits]); // Append new images
        }
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Failed to fetch images. Please try again later.");
      }
      setLoading(false);
    };

    getImages();
  }, [searchQuery, page, category]); // Fetch new data when query, page, or category changes

  // Handle search input with debouncing
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setFilteredData([]); // Clear old results
      setPage(1); // Reset to first page
      setHasMore(true); // Reset hasMore state
    }, 500); // 500ms debounce time

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  return (
    <div
      className="bg-black min-h-screen"
      style={{
        backgroundImage:
          "url('https://cdn.pixabay.com/photo/2022/01/08/16/01/lamp-6924294_640.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div className="flex font-semibold justify-center text-white p-4">
        Royalty-Free and Free Images to Download
      </div>

      {/* Category Buttons */}
      <div className="flex gap-3 items-center justify-center">
        {["all", "photo", "vector", "illustration"].map((item) => (
          <button
            key={item}
            className={`border rounded-full px-4 py-2 ${
              category === item ? "bg-blue-500 text-white" : "bg-white bg-opacity-20 text-gray-400"
            } hover:bg-opacity-50 transition`}
            onClick={() => {
              setCategory(item);
              setFilteredData([]); // Clear old results
              setPage(1); // Reset to first page
              setHasMore(true); // Reset hasMore state
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex p-5 justify-center my-5">
        <input
          type="text"
          placeholder="Browse images, videos, illustrations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white bg-opacity-50 text-white rounded-full border px-6 py-2 w-[60%] focus:outline-none border-gray-500 placeholder-gray-200"
        />
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 text-center">{error}</div>}

      {/* Image Results */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-5">
        {filteredData.map((image, index) => {
          // Attach the ref to the last image
          if (filteredData.length === index + 1) {
            return (
              <div ref={lastImageRef} key={image.id} className="rounded-md overflow-hidden">
                <img
                  src={image.webformatURL}
                  alt={image.tags}
                  className="w-full h-auto rounded-lg shadow-md hover:scale-105 transition-transform"
                />
              </div>
            );
          } else {
            return (
              <div key={image.id} className="rounded-md overflow-hidden">
                <img
                  src={image.webformatURL}
                  alt={image.tags}
                  className="w-full h-auto rounded-lg shadow-md hover:scale-105 transition-transform"
                />
              </div>
            );
          }
        })}
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center my-5">
          <p className="text-white">Loading...</p>
        </div>
      )}

      {/* No More Images Message */}
      {!hasMore && (
        <div className="flex justify-center my-5">
          <p className="text-white">No more images to load.</p>
        </div>
      )}
    </div>
  );
}