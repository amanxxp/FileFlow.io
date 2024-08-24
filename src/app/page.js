'use client'
import React, { useEffect, useState } from "react";

const Page = () => {
  const [fileData, setFileData] = useState([]);
  const [error, setError] = useState(null);
  const [searchString,setSerchString] = useState('');

  const handleSearch =()=>{
    fetch(`/api/?search=${encodeURIComponent(searchString)}`)
      .then((response)=>{
        if(!response.ok){
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data)=>{
        setFileData(data);
      })
      .catch((error)=>{
        setError(error.message);
      })
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>File Data</h1>
      <input
        type="text"
        placeholder="Enter the Search String"
        value={searchString}
        onChange={(e)=> setSerchString(e.target.value)}
        className="text-black"
      />
      <button onClick={handleSearch}>Search</button>
      {error && <div>Error: {error} </div> }
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
    </div>
  );
};

export default Page;
