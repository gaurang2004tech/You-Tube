import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setvideo] = useState<any>([]);
  const [loading, setloading] = useState(true);
  useEffect(() => {
    const fetchvideo = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        if (res.data) setvideo(res.data);
      } catch (error) {
        console.log("Failed to fetch videos:", error);
      } finally {
        setloading(false);
      }
    };
    fetchvideo();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <>Loading..</>
      ) : videos && videos.length > 0 ? (
        videos.map((video: any) => <Videocard key={video._id} video={video} />)
      ) : (
        <div className="col-span-full text-center py-10 text-gray-500">
          No videos found or server is offline.
        </div>
      )}
    </div>
  );
};

export default Videogrid;
