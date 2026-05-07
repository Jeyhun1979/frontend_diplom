import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "../../components/ui/Container";
import { BookingHeader } from "../../components/common/BookingHeader/BookingHeader";

import { TrainCard } from "../../components/common/TrainCard";
import { SearchFilters } from "../../components/common/SearchFilters";
import { Loader } from "../../components/ui/Loader";
import { LastTickets } from "../../components/common/LastTickets/LastTickets";
import { useTicketStore } from "../../store";
import { routesApi } from "../../services/routesApi";
import { mapRouteToTrainCard } from "../../utils/routeViewModel";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import "./SearchPage.css";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 1) return [1];
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const set = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(set)
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);
}

export function SearchPage() {
  const location = useLocation();
  const storeSearchData = useTicketStore((s) => s.searchData);
  const storeSearchParams = useTicketStore((s) => s.searchParams);
  const setSearchData = useTicketStore((s) => s.setSearchData);
  const setSearchParams = useTicketStore((s) => s.setSearchParams);
  const setSelectedTrain = useTicketStore((s) => s.setSelectedTrain);

  const initialSearchData = location.state?.searchData || storeSearchData;

  const [routes, setRoutes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [currentSearchData, setCurrentSearchData] = useState(initialSearchData);
  const [sort, setSort] = useState(storeSearchParams?.sort || "date");
  const limit = storeSearchParams?.limit || 5;
  const offset = storeSearchParams?.offset || 0;
  const inFlightRef = useRef(0);
  const progressTimerRef = useRef(null);
  const lastParamsKeyRef = useRef("");

  const trainCards = useMemo(() => routes.map(mapRouteToTrainCard), [routes]);

  const fetchRoutes = async (params) => {
    const requestId = Date.now();
    inFlightRef.current = requestId;

    const startProgress = () => {
      setProgress(0);
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = window.setInterval(() => {
        setProgress((p) => {
          if (p >= 90) return p;
          const next = p + Math.max(1, Math.round((90 - p) * 0.08));
          return Math.min(90, next);
        });
      }, 120);
    };
    const stopProgress = () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    };

    setLoading(true);
    setError("");
    startProgress();
    try {
      const response = await routesApi.search(params);
      if (inFlightRef.current !== requestId) return;
      setRoutes(response?.items ?? []);
      setTotalCount(response?.total_count ?? 0);
    } catch (e) {
      if (inFlightRef.current !== requestId) return;
      setRoutes([]);
      setTotalCount(0);
      setError(e?.message || "Не удалось получить список направлений");
    } finally {
      if (inFlightRef.current !== requestId) return;
      stopProgress();
      setProgress(100);
      setLoading(false);
      setSearchPerformed(true);
    }
  };

  const handleSearch = async (searchData) => {
    setCurrentSearchData(searchData);
    setSearchData(searchData);
    setSearchPerformed(true);
  };

  const handleFilterChange = async (params) => {
    if (!params) return;
    setSearchParams(params);
    setSearchPerformed(true);
  };

  const handleSortChange = async (e) => {
    const nextSort = e.target.value;
    setSort(nextSort);
    if (!storeSearchParams) return;
    const params = { ...storeSearchParams, sort: nextSort, offset: 0 };
    setSearchParams(params);
    setSearchPerformed(true);
  };

  const canPrev = offset > 0;
  const canNext = offset + limit < totalCount;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.floor(offset / limit) + 1;
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const goPrev = async () => {
    if (!storeSearchParams || !canPrev) return;
    const params = { ...storeSearchParams, offset: Math.max(0, offset - limit) };
    setSearchParams(params);
    setSearchPerformed(true);
  };

  const goNext = async () => {
    if (!storeSearchParams || !canNext) return;
    const params = { ...storeSearchParams, offset: offset + limit };
    setSearchParams(params);
    setSearchPerformed(true);
  };

  const goToPage = async (page) => {
    if (!storeSearchParams) return;
    const safe = Math.max(1, Math.min(totalPages, page));
    const params = { ...storeSearchParams, offset: (safe - 1) * limit };
    setSearchParams(params);
    setSearchPerformed(true);
  };

  useEffect(() => {
    if (!storeSearchParams?.from_city_id || !storeSearchParams?.to_city_id) return;
    const key = JSON.stringify(storeSearchParams);
    if (key === lastParamsKeyRef.current) return;
    lastParamsKeyRef.current = key;
    fetchRoutes(storeSearchParams);
    return () => {
      if (progressTimerRef.current) window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    };
  }, [storeSearchParams]);

  return (
    <div className="search-page">
      <BookingHeader
        activeStep={1}
        onSearch={handleSearch}
        initialData={currentSearchData}
        isSearching={loading}
        searchProgress={progress}
      />

      <Container>
        {loading ? (
          <div className="search-loading-screen">
            <div className="search-loading-screen__inner">
              <div className="search-loading-screen__title">ИДЕТ ПОИСК</div>
              <div className="search-loading-screen__train" aria-hidden="true" />
              <div className="search-loading-screen__bar">
                <div
                  className="search-loading-screen__bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="search-layout">
            <aside className="search-sidebar">
              <SearchFilters onFilterChange={handleFilterChange} />
              <LastTickets variant="sidebar" />
            </aside>

            <main className="search-content">
              {!searchPerformed ? (
                <div className="search-placeholder">
                  Введите параметры и нажмите "Найти билеты"
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <div className="results-count">
                      Найдено {totalCount} поезд{totalCount !== 1 ? "ов" : ""}
                    </div>
                    <div className="results-sort">
                      <label>
                        Сортировка{" "}
                        <select value={sort} onChange={handleSortChange}>
                          <option value="date">по дате</option>
                          <option value="price">по цене</option>
                          <option value="duration">по длительности</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {error ? <div className="error">{error}</div> : null}

                  {trainCards.length > 0 ? (
                    trainCards.map((train) => (
                      <TrainCard
                        key={train.id}
                        train={train}
                        onSelect={() => setSelectedTrain(train.raw)}
                      />
                    ))
                  ) : (
                    <div className="no-results">
                      Поездов не найдено. Попробуйте изменить параметры поиска.
                    </div>
                  )}

                  {totalPages > 1 ? (
                    <div className="pagination pp-pagination">
                      <button
                        type="button"
                        className="pp-page pp-page--arrow"
                        onClick={() => goToPage(1)}
                        disabled={!canPrev}
                        aria-label="Первая страница"
                      >
                        «
                      </button>
                      <button
                        type="button"
                        className="pp-page pp-page--arrow"
                        onClick={goPrev}
                        disabled={!canPrev}
                        aria-label="Предыдущая страница"
                      >
                        ‹
                      </button>
                      {pageNumbers.map((p) => (
                        <button
                          key={p}
                          type="button"
                          className={`pp-page ${p === currentPage ? "pp-page--active" : ""}`}
                          onClick={() => goToPage(p)}
                          aria-current={p === currentPage ? "page" : undefined}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        type="button"
                        className="pp-page pp-page--arrow"
                        onClick={goNext}
                        disabled={!canNext}
                        aria-label="Следующая страница"
                      >
                        ›
                      </button>
                      <button
                        type="button"
                        className="pp-page pp-page--arrow"
                        onClick={() => goToPage(totalPages)}
                        disabled={!canNext}
                        aria-label="Последняя страница"
                      >
                        »
                      </button>
                    </div>
                  ) : null}
                </>
              )}
            </main>
          </div>
        )}
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
