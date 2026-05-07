import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/Button";
import "./SearchForm.css";

export function SearchForm({ hero = false, onSearch, initialData }) {
  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: "",
    passengers: 1,
    ...initialData,
  });

  const handleChange = (e) => {
    setSearchData({
      ...searchData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchData);
    } else {
      navigate("/search", { state: { searchData } });
    }
  };

  return (
    <form
      className={`search-form ${hero ? "search-form--hero" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="search-form__fields">
        <div className="search-form__field">
          <label>Откуда</label>
          <input
            type="text"
            name="from"
            placeholder="Город отправления"
            value={searchData.from}
            onChange={handleChange}
            required
          />
        </div>

        <div className="search-form__field">
          <label>Куда</label>
          <input
            type="text"
            name="to"
            placeholder="Город прибытия"
            value={searchData.to}
            onChange={handleChange}
            required
          />
        </div>

        <div className="search-form__field">
          <label>Дата</label>
          <input
            type="date"
            name="date"
            value={searchData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="search-form__field">
          <label>Пассажиры</label>
          <input
            type="number"
            name="passengers"
            min="1"
            max="9"
            value={searchData.passengers}
            onChange={handleChange}
            required
          />
        </div>

        <Button type="submit" variant="primary" size="large">
          Найти билеты
        </Button>
      </div>
    </form>
  );
}
