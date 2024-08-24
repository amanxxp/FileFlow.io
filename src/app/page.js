"use client";
import React, { useState, useEffect } from "react";

const Page = () => {
  const [fileData, setFileData] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState(null);
  const [limit, setlimit] = useState(3); // Number of files per page

  const fetchFiles = async (page = 1) => {
    try {
      const response = await fetch(
        `/api/?search=${encodeURIComponent(
          searchString
        )}&page=${page}&limit=${limit}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setFileData(data.files);
      setTotalPages(Math.ceil(data.totalFiles / limit)); // Calculate total pages
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchFiles(currentPage);
  }, [currentPage]); // Fetch files when the page changes

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchFiles(1);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <h1 className="text-center text-[8vh] mt-5">File Data</h1>
      <div className="text-center">
        <input
          type="text"
          placeholder="Enter the Search String"
          value={searchString}
          onKeyDown={handleKeyDown} // Listen for Enter key press
          onChange={(e) => setSearchString(e.target.value)}
          className="text-black px-3 py-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={handleSearch}
          className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Search
        </button>
      </div>
      <div className="text-center">
        <input
          type="number"
          placeholder="100"
          value={limit}
          onKeyDown={handleKeyDown}
          onChange={(e) => setlimit(e.target.value)}
          className="text-black px-3 py-2 border border-gray-300 rounded-md"
        />
        <button onClick={handleSearch} className="ml-4 mt-4 px-[12px] py-2 bg-blue-500 text-white rounded-md">Set limit </button>
      </div>

      <div className="pagination ">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={currentPage === index + 1}
            className={`px-4 py-2 mt-10 mx-1 ${
              currentPage === index + 1 ? "bg-gray-900" : "bg-gray-500"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {error && <div>Error: {error}</div>}

      {fileData.length === 0 ? (
        <p>No files found</p>
      ) : (
        <ul className="p-10">
          {fileData.map((file, index) => (
            <li key={index} className="p-10">
              <strong>File:</strong> {file.file}
              <br />
              <strong>Content:</strong>
              <pre>{file.content}</pre>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            disabled={currentPage === index + 1}
            className={`px-4 py-2 mx-1 ${
              currentPage === index + 1 ? "bg-gray-900" : "bg-gray-500"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Page;
