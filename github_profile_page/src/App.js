import { useState, useEffect } from "react";

export default function App() {
  const [query, setQuery] = useState("GitHub");
  const [user, setUser] = useState({});
  const [repos, setRepos] = useState({});
  const [repoCount, setRepoCount] = useState(4);
  const [loading, setLoading] = useState(false);

  function handleSearchQuery(que) {
    setQuery(que);
  }

  function handleSetUser(dt) {
    setUser(dt);
  }

  /* useEffect to fetch user data from search query */
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchData() {
        setLoading(true);
        try {
          const res = await fetch(`https://api.github.com/users/${query}`, {
            signal: controller.signal,
          });
          if (!res.ok) throw new Error("Error occur while fetching");
          const data = await res.json();
          setLoading(false);
          setUser(data);
          console.log(data);
        } catch (err) {
          console.log(err);
          console.error(err.message);
        }
      }

      if (query.length === 0) setUser();

      fetchData();
      return function () {
        controller.abort();
      };
    },
    [query]
  );

  /* useEffect to fetch user repo data */
  useEffect(
    function () {
      const controller = new AbortController();
      async function fetchRepoData() {
        try {
          const res = await fetch(
            `https://api.github.com/users/${user.login}/repos`,
            {
              signal: controller.signal,
            }
          );
          if (!res.ok)
            throw new Error("Error occur while fetching repository data");
          const data = await res.json();
          setRepos(data);
        } catch (err) {
          console.log(err);
          console.error(err.message);
        }
      }
      fetchRepoData();
      return function () {
        controller.abort();
      };
    },
    [user]
  );

  return (
    <div className="App">
      <Header
        query={query}
        setQuery={handleSearchQuery}
        setData={handleSetUser}
      />
      <Main
        data={user}
        loading={loading}
        repos={repos}
        repoCount={repoCount}
        setRepoCount={setRepoCount}
      />
    </div>
  );
}

function Loader() {
  return <p className="loader"> LOADING DATA.....</p>;
}

function Search({ query, setQuery }) {
  return (
    <div className="searchContainer">
      <img src="./assets/Search.svg" alt="search-icon" id="search-icon" />
      <input
        type="text"
        className="search-input"
        placeholder="username"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      ></input>
    </div>
  );
}

function Header({ query, setQuery, setData }) {
  return (
    <header>
      <Search setQuery={setQuery} query={query} />
    </header>
  );
}

function Stat({ statKey, statValue }) {
  return (
    <div className="stat">
      <span className="stat-key">{statKey}</span>|
      <span className="stat-value">{statValue}</span>
    </div>
  );
}

function UserStats({ avatarURL, followers, follwings, location }) {
  return (
    <div className="stats-container">
      <img src={avatarURL} alt="github-image" />
      <div className="stats-details">
        <Stat statKey="Followers" statValue={followers} />
        <Stat statKey="Following" statValue={follwings} />
        <Stat statKey="Location" statValue={location} />
      </div>
    </div>
  );
}

function StatIcon({ img, text }) {
  return (
    <span className="repo-card-stat">
      <img src={img} alt={text} />
      <span>{text}</span>
    </span>
  );
}

function RepoStats({ repo }) {
  return (
    <div className="repo-stats">
      <ul>
        {repo.license && (
          <li>
            <StatIcon img={"./assets/Chield_alt.svg"} text={repo.license.key} />
          </li>
        )}
        <li>
          <StatIcon img={"./assets/Nesting.svg"} text={repo.forks_count} />
        </li>
        <li>
          <StatIcon img={"./assets/Star.svg"} text={repo.stargazers_count} />
        </li>
      </ul>
    </div>
  );
}

function RepoCard({ repo }) {
  function daysBetween(dateString) {
    const targetDate = new Date(dateString);
    const currentDate = new Date();
    const timeDifference = targetDate - currentDate;

    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return Math.abs(daysDifference);
  }

  return (
    <div className="repo-card">
      <h2>{repo.name}</h2>
      <p className="description">
        {repo.description?.split(" ").slice(0, 10).join(" ")}...
      </p>
      <div>
        <RepoStats repo={repo} />
        <p> updated {daysBetween(repo.updated_at)} days ago</p>
      </div>
    </div>
  );
}

function ReposSection({ repos, repoCount, setRepoCount }) {
  return (
    <section className="repo-section">
      {repos.length > 0 &&
        repos.map(
          (repo, ind) =>
            ind < repoCount && (
              <RepoCard repo={repo} key={crypto.randomUUID()} />
            )
        )}
      <ButtonAllRepositories
        setRepoCount={setRepoCount}
        repos={repos}
        repoCount={repoCount}
      />
    </section>
  );
}

function ButtonAllRepositories({ repos, setRepoCount, repoCount }) {
  function handleViewAllRepo() {
    if (repoCount <= 4) setRepoCount(repos.length);
    else setRepoCount(4);
  }

  return (
    <button className="view-all" onClick={handleViewAllRepo}>
      {repoCount <= 4 ? "View All Repositories" : "Minimize All repos"}
    </button>
  );
}

function Main({ data, loading, repos, repoCount, setRepoCount }) {
  return (
    <>
      <main>
        {data ? (
          loading === false ? (
            <>
              <UserStats
                avatarURL={data.avatar_url}
                followers={data.followers}
                follwings={data.following}
                location={data.location}
              />
              <h1>{data.name}</h1>
              <p className="description">{data.bio}</p>
              <ReposSection
                repos={repos}
                repoCount={repoCount}
                setRepoCount={setRepoCount}
              />
            </>
          ) : (
            <Loader />
          )
        ) : (
          <h1 className="no-data">Data not available, Please search profile</h1>
        )}
      </main>
    </>
  );
}
