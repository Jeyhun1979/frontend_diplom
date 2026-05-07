import "./Loader.css";

export function Loader({ size = "medium", fullPage = false }) {
  const loader = <div className={`loader loader--${size}`}></div>;

  if (fullPage) {
    return <div className="loader-fullpage">{loader}</div>;
  }

  return loader;
}
