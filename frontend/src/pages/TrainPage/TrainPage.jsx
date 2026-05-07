import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { Container } from "../../components/ui/Container";
import { Button } from "../../components/ui/Button";
import { SeatSelection } from "../../components/common/SeatSelection";
import { BookingHeader } from "../../components/common/BookingHeader/BookingHeader";
import { SearchFilters } from "../../components/common/SearchFilters";
import { Loader } from "../../components/ui/Loader";

import { saveBookingDraft, getBookingDraft } from "../../utils/bookingDraft";
import { useTicketStore } from "../../store";
import { mapRouteToTrainCard } from "../../utils/routeViewModel";
import { routesApi } from "../../services/routesApi";
import { ContactsSubscribe } from "../../components/common/ContactsSubscribe/ContactsSubscribe";
import "./TrainPage.css";

export function TrainPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [returnSelectedSeats, setReturnSelectedSeats] = useState([]);
  const selectedTrain = useTicketStore((s) => s.selectedTrain);
  const returnTrain = useTicketStore((s) => s.returnTrain);
  const setReturnTrain = useTicketStore((s) => s.setReturnTrain);
  const [coaches, setCoaches] = useState([]);
  const [returnCoaches, setReturnCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useTicketStore((s) => s.searchParams);
  const searchData = useTicketStore((s) => s.searchData);
  const [returnRoutes, setReturnRoutes] = useState([]);
  const [returnRoutesLoading, setReturnRoutesLoading] = useState(false);
  const [returnSeatsLoading, setReturnSeatsLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const fromDraft = getBookingDraft()?.selectedTrain || getBookingDraft()?.train;
  const raw = selectedTrain || location.state?.train || fromDraft || null;
  const train = raw?.departure?._id ? mapRouteToTrainCard(raw) : raw;
  const hasReturn = Boolean(searchData?.dateTo && searchParams?.from_city_id && searchParams?.to_city_id);
  const seatsInFlightRef = useRef(0);
  const returnSeatsInFlightRef = useRef(0);
  const returnRoutesInFlightRef = useRef(0);

  const seatParams = useMemo(() => {
    if (!searchParams) return undefined;
    return {
      have_first_class: searchParams.have_first_class,
      have_second_class: searchParams.have_second_class,
      have_third_class: searchParams.have_third_class,
      have_fourth_class: searchParams.have_fourth_class,
      have_wifi: searchParams.have_wifi,
      have_air_conditioning: searchParams.have_air_conditioning,
      have_express: searchParams.have_express,
    };
  }, [
    searchParams?.have_first_class,
    searchParams?.have_second_class,
    searchParams?.have_third_class,
    searchParams?.have_fourth_class,
    searchParams?.have_wifi,
    searchParams?.have_air_conditioning,
    searchParams?.have_express,
  ]);

  const seatParamsKey = useMemo(() => JSON.stringify(seatParams ?? {}), [seatParams]);

  const returnParams = useMemo(() => {
    if (!hasReturn) return null;
    const {
      date_end,
      from_city_id,
      to_city_id,
      offset,
      ...rest
    } = searchParams || {};

    return {
      ...rest,
      from_city_id: to_city_id,
      to_city_id: from_city_id,
      ...(searchData?.dateTo && date_end ? { date_start: date_end } : {}),
      offset: 0,
    };
  }, [hasReturn, searchParams, searchData?.dateTo]);

  const returnParamsKey = useMemo(
    () => JSON.stringify(returnParams ?? {}),
    [returnParams],
  );

  useEffect(() => {
    const fetch = async () => {
      const requestId = Date.now();
      seatsInFlightRef.current = requestId;
      try {
        setLoading(true);
        setError("");
        const data = await routesApi.seats(id, seatParams);
        if (seatsInFlightRef.current !== requestId) return;
        setCoaches(Array.isArray(data) ? data : []);
      } catch (e) {
        if (seatsInFlightRef.current !== requestId) return;
        setCoaches([]);
        setError(e?.message || "Не удалось загрузить схему мест");
      } finally {
        if (seatsInFlightRef.current !== requestId) return;
        setLoading(false);
      }
    };
    fetch();
  }, [id, seatParamsKey]);

  useEffect(() => {
    if (!hasReturn) {
      setReturnRoutes([]);
      setReturnCoaches([]);
      setReturnError("");
      setReturnTrain(null);
      setReturnSelectedSeats([]);
      return;
    }

    const fetchReturn = async () => {
      const requestId = Date.now();
      returnRoutesInFlightRef.current = requestId;
      try {
        setReturnRoutesLoading(true);
        setReturnError("");
        const resp = await routesApi.search(returnParams ?? {});
        if (returnRoutesInFlightRef.current !== requestId) return;
        setReturnRoutes(resp?.items ?? []);
      } catch (e) {
        if (returnRoutesInFlightRef.current !== requestId) return;
        setReturnRoutes([]);
        setReturnError(e?.message || "Не удалось получить список обратных направлений");
      } finally {
        if (returnRoutesInFlightRef.current !== requestId) return;
        setReturnRoutesLoading(false);
      }
    };

    fetchReturn();
  }, [hasReturn, returnParamsKey, setReturnTrain]);

  useEffect(() => {
    if (!hasReturn) return;
    if (!returnTrain?.id) return;
    const fetchReturnSeats = async () => {
      const requestId = Date.now();
      returnSeatsInFlightRef.current = requestId;
      try {
        setReturnSeatsLoading(true);
        setReturnError("");
        const data = await routesApi.seats(returnTrain.id, seatParams);
        if (returnSeatsInFlightRef.current !== requestId) return;
        setReturnCoaches(Array.isArray(data) ? data : []);
      } catch (e) {
        if (returnSeatsInFlightRef.current !== requestId) return;
        setReturnCoaches([]);
        setReturnError(e?.message || "Не удалось загрузить схему мест (обратно)");
      } finally {
        if (returnSeatsInFlightRef.current !== requestId) return;
        setReturnSeatsLoading(false);
      }
    };
    fetchReturnSeats();
  }, [hasReturn, returnTrain?.id, seatParamsKey]);

  const handleContinue = () => {
    const payload = {
      train: train.raw ?? train,
      selectedSeats,
      ...(hasReturn
        ? { returnTrain: returnTrain?.raw ?? returnTrain, returnSeats: returnSelectedSeats }
        : {}),
    };
    saveBookingDraft(payload);
    navigate("/passenger", {
      state: {
        train,
        selectedSeats,
        returnTrain,
        returnSeats: returnSelectedSeats,
      },
    });
  };

  const canProceed =
    selectedSeats.length > 0 &&
    (!hasReturn ||
      (returnTrain?.id && returnSelectedSeats.length > 0 && returnSelectedSeats.length === selectedSeats.length));

  return (
    <div className="train-page">
      <BookingHeader activeStep={1} />
      <Container>
        <div className="train-page__layout">
          <aside className="train-page__sidebar">
            <SearchFilters onFilterChange={() => {}} />
          </aside>

          <div className="train-page__main">
            <div className="train-page__header">
              <h1 className="train-page__title">ВЫБОР МЕСТ</h1>
            </div>

            <div className="train-page__content">
              {!train ? (
                <div className="error">
                  Не удалось определить выбранное направление. Вернитесь к поиску
                  и выберите поезд заново.
                </div>
              ) : null}
              {error ? <div className="error">{error}</div> : null}
              {loading ? <Loader /> : null}
              {!loading && !error && train && coaches.length > 0 ? (
                <SeatSelection
                  onSelectSeats={setSelectedSeats}
                  train={train}
                  coaches={coaches}
                />
              ) : null}

              {hasReturn ? (
                <div className="train-page__return">
                  <h2 className="train-page__subtitle">ОБРАТНО</h2>
                  {returnError ? <div className="error">{returnError}</div> : null}
                  {returnRoutesLoading || returnSeatsLoading ? <Loader /> : null}
                  {!returnRoutesLoading && !returnSeatsLoading && !returnError ? (
                    <>
                      {!returnTrain ? (
                        <div className="return-trains">
                          {(returnRoutes || []).slice(0, 5).map((r) => {
                            const mapped = mapRouteToTrainCard(r);
                            return (
                              <div key={mapped.id} className="return-train-item">
                                <Button
                                  variant="outline"
                                  onClick={() => setReturnTrain(mapped)}
                                >
                                  Выбрать поезд №{mapped.number} {mapped.from} → {mapped.to}
                                </Button>
                              </div>
                            );
                          })}
                          {!returnRoutes?.length ? (
                            <div className="no-results">
                              Обратных поездов не найдено. Попробуйте изменить дату.
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {returnTrain && returnCoaches.length ? (
                        <SeatSelection
                          onSelectSeats={setReturnSelectedSeats}
                          train={returnTrain}
                          coaches={returnCoaches}
                        />
                      ) : null}
                      {returnTrain && returnSelectedSeats.length && selectedSeats.length !== returnSelectedSeats.length ? (
                        <div className="error">
                          Для поездки туда‑обратно количество мест должно совпадать.
                        </div>
                      ) : null}
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="train-page__footer">
              <div className="total-info">
                <span>Выбрано мест: {selectedSeats.length}</span>
                <span className="total-price">
                  Итого:{" "}
                  {train
                    ? selectedSeats
                        .reduce((sum, s) => sum + (Number(s?.price ?? s?.basePrice ?? 0) || 0), 0)
                        .toLocaleString()
                    : "—"}{" "}
                  ₽
                </span>
              </div>
              <Button
                variant="primary"
                onClick={handleContinue}
                disabled={!train || !canProceed}
              >
                ДАЛЕЕ
              </Button>
            </div>
          </div>
        </div>
      </Container>
      <ContactsSubscribe />
    </div>
  );
}
