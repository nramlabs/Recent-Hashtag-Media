"use client";

import Image from "next/image";
import moment from "moment";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [user, setuser] = useState("");

  const [token, settoken] = useState("");

  const [url, seturl] = useState("");

  const [data, setdata] = useState({ data: [] });

  const [show, setshow] = useState(false);

  const [showAlbum, setshowAlbum] = useState(false);

  const [ht, setht] = useState("");

  const [tags, setTags] = useState({});

  const [error, setError] = useState("");

  const baseURL = "https://graph.facebook.com/v17.0/";

  const [mediaURL, setMediaURL] = useState("");
  const [nextURL, setNextURL] = useState("");

  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setTags(localStorage.getItem("tags"));
  }, []);

  useEffect(() => {
    setMediaURL(
      `recent_media?access_token=${token}&user_id=${user}&limit=${limit}&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`
    );
    setNextURL(
      `recent_media?access_token=${token}&user_id=${user}&limit=${limit}&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`
    );
    setdata({ data: [] });
  }, [limit]);

  async function getHashtagID(ht) {
    setdata({ data: [] });
    setshow(true);
    setError("");
    const options = {
      method: "GET",
    };

    const res = await fetch(
      baseURL +
        `ig_hashtag_search?access_token=${token}&user_id=${user}&q=${ht}`
    );

    const data = await res.json();

    if (res.status === 200) {
      const hashtagId = data.data[0].id;

      var lstags = localStorage.getItem("tags");

      lstags = lstags ? JSON.parse(lstags) : {};

      lstags[ht] = hashtagId;

      localStorage.setItem("tags", JSON.stringify(lstags));

      setTags(JSON.stringify(lstags));

      getMedia(url, hashtagId);
    } else if (res.status === 400) {
      setError(data.error?.error_user_title);
      setshow(false);
    }
  }

  async function getMedia(url, ht) {
    setdata({ data: [] });
    setshow(true);
    setError("");
    url = baseURL + `${ht}/` + mediaURL;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      if (response.status === 200) {
        setdata(result);
        seturl(result.paging.next);
      } else {
        setdata({ data: [] });
        setError(result.error?.message);
      }
      setshow(false);
    } catch (error) {
      setshow(false);
    }
  }

  async function getNext(url, ht) {
    setdata({ data: [] });
    setshow(true);
    if (!url) url = baseURL + `${ht}/` + nextURL;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      if (response.status === 200) {
        setdata(result);
        seturl(result.paging.next);
        window.scrollTo(0, 0);
      } else {
        setdata({ data: [] });
        setError(result.error?.message);
      }
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

  const handleChange = async (event) => {
    setLimit(event.target.value);
  };

  return (
    <main className="bg-white h-screen flex flex-col items-center justify-between px-24 py-12">
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
          <div className="w-screen p-2">
            <form onSubmit={handleSearch}>
              <label>
                <input
                  class="block w-full text-3xl rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  type="text"
                  id="searchterm"
                  name="searchterm"
                  placeholder="Search by hashtag"
                  value={ht}
                  onChange={(e) => setht(e.target.value)}
                />
              </label>
            </form>
            <select name="option" onChange={handleChange} value={limit}>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
              <option value="40">40</option>
              <option value="50">50</option>
            </select>
          </div>
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
                    class="flex w-full justify-center rounded-md bg-sky-500	px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                    onClick={() => getMedia(url, tag[1])}
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
        <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div class="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 class="mt-10 text-center text-base font-bold leading-9 tracking-tight text-gray-900">
              Enter your User ID and Long-Lived Access Token
            </h2>
          </div>
          <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form class="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="userid"
                  class="block text-sm font-medium leading-6 text-gray-900"
                >
                  User ID
                </label>
                <div class="mt-2">
                  <input
                    type="text"
                    id="userid"
                    name="userid"
                    class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lltoken"
                  class="block text-sm font-medium leading-6 text-gray-900"
                >
                  Token
                </label>
                <div class="mt-2">
                  <input
                    type="password"
                    id="lltoken"
                    name="lltoken"
                    class="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
