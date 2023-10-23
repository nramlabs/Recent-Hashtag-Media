"use client";

import Image from "next/image";
import moment from "moment";
import React, { useState } from "react";

export default function Home() {
  const [user, setuser] = useState("");

  const [token, settoken] = useState("");

  const [url, seturl] = useState("");

  const [data, setdata] = useState({ data: [] });

  const [show, setshow] = useState(false);

  const [showAlbum, setshowAlbum] = useState(false);

  const [ht, setht] = useState("");

  const [tags, setTags] = useState(localStorage.getItem("tags"));

  const [error, setError] = useState("");

  async function getHashtagID(ht) {
    setdata({ data: [] });
    setshow(true);
    setError("");
    const tagurl = `https://graph.facebook.com/v17.0/ig_hashtag_search?access_token=${token}&user_id=${user}&q=${ht}`;
    const options = {
      method: "GET",
    };

    const res = await fetch(tagurl);

    const data = await res.json();

    if (res.status === 200) {
      const hashtagId = data.data[0].id;

      var lstags = localStorage.getItem("tags");

      lstags = lstags ? JSON.parse(lstags) : {};

      lstags[ht] = hashtagId;

      localStorage.setItem("tags", JSON.stringify(lstags));

      setTags(JSON.stringify(lstags));

      getImages(url, hashtagId);
    } else if (res.status === 400) {
      setError(data.error?.error_user_title);
      setshow(false);
    }
  }

  async function getImages(url, ht) {
    setdata({ data: [] });
    setshow(true);
    setError("");
    url = `https://graph.facebook.com/v17.0/${ht}/recent_media?access_token=${token}&user_id=${user}&limit=50&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      setdata(result);
      seturl(result.paging.next);
      setshow(false);
    } catch (error) {
      setshow(false);
    }
  }

  async function getNext(url, ht) {
    setdata({ data: [] });
    setshow(true);
    if (!url)
      url = `https://graph.facebook.com/v17.0/${ht}/recent_media?access_token=${token}&user_id=${user}&limit=50&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      setdata(result);
      seturl(result.paging.next);
      window.scrollTo(0, 0);
      setshow(false);
    } catch (error) {
      setshow(false);
    }
  }

  const handleSearch = async (event) => {
    event.preventDefault();

    const term = event.target.searchterm.value;
    if (term.length > 0) {
      setht(event.target.searchterm.value);

      getHashtagID(event.target.searchterm.value);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setuser(event.target.userid.value);
    settoken(event.target.lltoken.value);
  };

  return (
    <main className="flex flex-col items-center justify-between px-24 py-12">
      {token ? (
        show ? (
          <p className="fixed top-0 left-0 right-0 bg-amber-500 text-white p-1 text-center">
            Loading...
          </p>
        ) : (
          <p className="fixed top-0 left-0 right-0 bg-indigo-500 text-white p-1 text-center">
            Ready
          </p>
        )
      ) : (
        <></>
      )}
      {user && token ? (
        <div>
          <form onSubmit={handleSearch}>
            <label>
              <input
                className="w-full text-3xl	p-1.5		"
                type="text"
                id="searchterm"
                name="searchterm"
                placeholder="Search by hashtag"
                value={ht}
                onChange={(e) => setht(e.target.value)}
              />
            </label>
          </form>
          <p>{error}</p>
          {data.data.length ? (
            <button
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 my-2 border border-gray-400 rounded shadow"
              onClick={() => setshowAlbum(!showAlbum)}
            >
              Show Albums
            </button>
          ) : (
            <></>
          )}
          {tags ? (
            <div className="flex gap-1 mt-4 mb-4">
              {Object.entries(JSON.parse(tags)).map((tag, index) => {
                return (
                  <button
                    key={index}
                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                    onClick={() => getImages(url, tag[1])}
                  >
                    {tag[0]}
                  </button>
                );
              })}
            </div>
          ) : (
            <></>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {data.data.map((i, index) => {
              if (i.media_type === "IMAGE")
                return (
                  <div
                    key={index}
                    className="m-6"
                    style={{ maxWidth: "300px" }}
                  >
                    <a href={i.permalink}>
                      <Image
                        src={i.media_url}
                        className="dark:invert"
                        width={400}
                        height={400}
                        style={{
                          width: "auto",
                          height: "auto",
                        }}
                        unoptimized
                        alt="photo"
                      />
                    </a>
                    {i.caption?.toLowerCase().includes("telugu") ||
                    i.caption?.toLowerCase().includes("hyderabad") ? (
                      <button className="bg-red-200 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-2 border border-gray-400 rounded shadow">
                        TELUGU
                      </button>
                    ) : (
                      <></>
                    )}
                    <p className="truncate" style={{ maxWidth: "300px" }}>
                      {i.caption}
                    </p>
                    <p style={{ maxWidth: "300px" }} className="text-xs">
                      {moment(i.timestamp).fromNow()}
                    </p>
                  </div>
                );
              else if (i.media_type === "VIDEO")
                return (
                  <div key={index}>
                    <a href={i.permalink}>
                      {i.media_url ? (
                        <video style={{ width: "300px", height: "300px" }}>
                          <source src={i.media_url} />
                        </video>
                      ) : (
                        <Image
                          src={"/Image_not_available.png"}
                          className="dark:invert"
                          width={400}
                          height={400}
                          style={{
                            width: "auto",
                            height: "auto",
                          }}
                          unoptimized
                          alt="photo"
                        />
                      )}
                    </a>
                    {i.caption?.toLowerCase().includes("telugu") ||
                    i.caption?.toLowerCase().includes("hyderabad") ? (
                      <button className="bg-red-200 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-2 border border-gray-400 rounded shadow">
                        TELUGU
                      </button>
                    ) : (
                      <></>
                    )}
                    <p className="truncate" style={{ maxWidth: "300px" }}>
                      {i.caption}
                    </p>
                    <p style={{ maxWidth: "300px" }} className="text-xs">
                      {moment(i.timestamp).fromNow()}
                    </p>
                  </div>
                );
              else if (
                i.media_type === "CAROUSEL_ALBUM" &&
                (showAlbum ||
                  i.caption?.toLowerCase().includes("telugu") ||
                  i.caption?.toLowerCase().includes("hyderabad"))
              )
                return (
                  <div key={index}>
                    <a href={i.permalink}>
                      {i.media_url ? (
                        <video style={{ width: "300px", height: "300px" }}>
                          <source src={i.media_url} />
                        </video>
                      ) : (
                        <Image
                          src={"/Image_not_available.png"}
                          className="dark:invert"
                          width={400}
                          height={400}
                          style={{
                            width: "auto",
                            height: "auto",
                          }}
                          unoptimized
                          alt="photo"
                        />
                      )}
                    </a>

                    {i.caption?.toLowerCase().includes("telugu") ||
                    i.caption?.toLowerCase().includes("hyderabad") ? (
                      <button className="bg-red-200 hover:bg-gray-100 text-gray-800 font-semibold py-2 px-2 border border-gray-400 rounded shadow">
                        TELUGU
                      </button>
                    ) : (
                      <></>
                    )}

                    <p className="truncate" style={{ maxWidth: "300px" }}>
                      {i.caption}
                    </p>
                    <p style={{ maxWidth: "300px" }} className="text-xs">
                      {moment(i.timestamp).fromNow()}
                    </p>
                  </div>
                );
            })}
          </div>
          {data.data.length ? (
            <div className="flex flex-col mt-4">
              <button
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-6 px-4 border border-gray-400 rounded shadow"
                onClick={() => getNext(url)}
              >
                Next
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
          <label htmlFor="userid">User ID</label>
          <input type="text" id="userid" name="userid" required />

          <label htmlFor="lltoken">Token</label>
          <input type="password" id="lltoken" name="lltoken" required />

          <button
            className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
            type="submit"
          >
            Submit
          </button>
        </form>
      )}
    </main>
  );
}
