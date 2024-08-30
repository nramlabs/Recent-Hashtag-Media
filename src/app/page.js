"use client";

import React, { useEffect, useState } from "react";

import Image from "next/image";
import moment from "moment";

export default function Home() {
  const [user, setuser] = useState("");

  const [token, settoken] = useState("");

  const [url, seturl] = useState("");

  const [urls, seturls] = useState([]);

  const [data, setdata] = useState({ data: [] });

  const [show, setshow] = useState(false);

  const [showAlbum, setshowAlbum] = useState(true);

  const [ht, setht] = useState("");

  const [tags, setTags] = useState({});

  const [error, setError] = useState("");

  const baseURL = "https://graph.facebook.com/v17.0/";

  const [mediaURL, setMediaURL] = useState("");
  const [nextURL, setNextURL] = useState("");

  const [limit, setLimit] = useState(50);

  useEffect(() => {
    setTags(sessionStorage.getItem("tags"));
    const r = JSON.parse(sessionStorage.getItem("urls"));
    if (r) seturls(JSON.parse(sessionStorage.getItem("urls")));

    const showValue = sessionStorage.getItem("showAlbums");
    if (showValue !== null) setshowAlbum(showValue);
  }, []);

  useEffect(() => {
    setMediaURL(
      `recent_media?access_token=${token}&user_id=${user}&limit=${limit}&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`
    );
    setNextURL(
      `recent_media?access_token=${token}&user_id=${user}&limit=${limit}&fields=caption%2Cchildren%2Cmedia_type%2Cmedia_url%2Cpermalink%2Ctimestamp`
    );
    setdata({ data: [] });
  }, [limit, user, token]);

  useEffect(() => {
    if (token) {
      seturls([]);
    }
  }, [limit]);

  useEffect(() => {
    if (urls?.length) {
      const tmp = [...urls];
      sessionStorage.setItem("urls", JSON.stringify(tmp));
    }
  }, [urls]);

  // console.log(user);
  // console.log(token);
  // console.log(mediaURL)
  // console.log(nextURL)
  // console.log("url: ", url)
  // console.log("urls length: ", urls.length);

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

      var lstags = sessionStorage.getItem("tags");

      lstags = lstags ? JSON.parse(lstags) : {};

      lstags[ht] = hashtagId;

      sessionStorage.setItem("tags", JSON.stringify(lstags));

      setTags(JSON.stringify(lstags));

      getMedia(url, hashtagId);
    } else if (res.status === 400) {
      setError(data.error?.error_user_title);
      setshow(false);
    }
  }

  async function getMedia(url, ht) {
    setdata({ data: [] });
    seturls([]);
    setshow(true);
    setError("");
    url = baseURL + `${ht}/` + mediaURL;
    const options = {
      method: "GET",
    };

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      // console.log(result);
      if (response.status === 200) {
        setdata(result);
        seturl(result.paging.next);
        seturls((i) => [...i, result.paging.next]);
      } else {
        setdata({ data: [] });
        setError(result.error?.message);
      }
      setshow(false);
    } catch (error) {
      setshow(false);
    }
  }

  async function getNext(url, ind, ht) {
    // console.log("index in getnext", ind);
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
        if (ind + 1 >= urls.length) seturls((i) => [...i, result.paging.next]);
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
    <main className="w-full h-screen flex flex-col items-center justify-between px-24 py-12">
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
        <div className="w-full">
          <div className="flex flex-row w-full">
            <form className="searchBar mx-1" onSubmit={handleSearch}>
              <label
                htmlFor="option"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Search
              </label>
              <input
                className="block w-full rounded-md border-0 p-2 leading-none text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                type="text"
                id="searchterm"
                name="searchterm"
                placeholder="Search by hashtag"
                value={ht}
                onChange={(e) => setht(e.target.value)}
              />
            </form>
            <div>
              <label
                htmlFor="option"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Limit
              </label>
              <select
                name="option"
                onChange={handleChange}
                value={limit}
                className="block w-full rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
              </select>
            </div>
          </div>
          <p className="text-red-700 pt-1">{error}</p>
          {data.data.length ? (
            <div className="flex items-center space-x-1 py-2">
              <input
                type="checkbox"
                className="border-gray-300 rounded h-5 w-5"
                onChange={(e) => {
                  setshowAlbum(!showAlbum);
                  sessionStorage.setItem("showAlbums", !showAlbum);
                }}
                checked={showAlbum}
              />
              <div className="flex flex-col">
                <h1 className="text-gray-700 font-medium leading-none">
                  Show Albums
                </h1>
              </div>
            </div>
          ) : (
            <></>
          )}
          {tags ? (
            <div className="flex gap-1 mt-1 mb-4">
              <label
                htmlFor="option"
                className="self-center block text-sm font-medium leading-6 text-gray-900"
              >
                Recent Searches:
              </label>
              {Object.entries(JSON.parse(tags)).map((tag, index) => {
                return (
                  <button
                    key={index}
                    className="flex w-auto justify-center rounded-md bg-sky-500	px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
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
              if (i.media_type === "IMAGE" || i.media_type === "CAROUSEL_ALBUM")
                return (
                  <div
                    key={index}
                    className="m-6"
                    style={{ maxWidth: "300px" }}
                  >
                    <a target="_blank" href={i.permalink}>
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
                    <a target="_blank" href={i.permalink}>
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
              else
                return (
                  <div
                    key={index}
                    className="m-6"
                    style={{ maxWidth: "300px" }}
                  >
                    <a target="_blank" href={i.permalink}>
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
            })}
          </div>
          {/* {data.data.length ? (
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
          )} */}
          <div className="flex justify-center mt-4 mb-2">
            {urls?.map((url, i) => (
              <div key={i} className="flex flex-col px-2">
                <button
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-4 px-4 border border-gray-400 rounded shadow"
                  onClick={() => {
                    // console.log("index in onclick", i);
                    getNext(url, i);
                  }}
                >
                  {urls?.length === i + 1 ? "Next" : i + 1}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-base font-bold leading-9 tracking-tight text-gray-900">
              Enter your User ID and Long-Lived Access Token
            </h2>
          </div>
          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="userid"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  User ID
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    id="userid"
                    name="userid"
                    className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="lltoken"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Token
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    id="lltoken"
                    name="lltoken"
                    className="block w-full rounded-md border-0 p-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    required
                  />
                </div>
              </div>
              <div>
                <button
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
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
