import { useState } from "react";
import "./PassengerForm.css";

export function PassengerForm({ passengerCount, onSubmit }) {
  const [passengers, setPassengers] = useState(
    Array(passengerCount)
      .fill()
      .map((_, i) => ({
        id: i,
        type: "adult",
        lastName: "",
        firstName: "",
        patronymic: "",
        gender: "M",
        birthDate: "",
        disability: false,
        documentType: "passport",
        passportSeries: "",
        passportNumber: "",
        birthCertNumber: "",
      })),
  );

  const handleChange = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = passengers.every(
      (p) =>
        p.lastName &&
        p.firstName &&
        p.birthDate &&
        (p.documentType === "passport"
          ? p.passportSeries && p.passportNumber
          : p.birthCertNumber),
    );
    if (!isValid) {
      alert("Заполните все обязательные поля");
      return;
    }
    onSubmit(passengers);
  };

  return (
    <form className="passenger-form" onSubmit={handleSubmit}>
      {passengers.map((passenger, idx) => (
        <div key={passenger.id} className="passenger-card">
          <div className="passenger-header">
            <span className="passenger-number">Пассажир {idx + 1}</span>
            <div className="passenger-type">
              <label className="radio-label">
                <input
                  type="radio"
                  name={`type-${idx}`}
                  value="adult"
                  checked={passenger.type === "adult"}
                  onChange={() => handleChange(idx, "type", "adult")}
                />
                Взрослый
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name={`type-${idx}`}
                  value="child"
                  checked={passenger.type === "child"}
                  onChange={() => handleChange(idx, "type", "child")}
                />
                Детский
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Фамилия</label>
              <input
                type="text"
                value={passenger.lastName}
                onChange={(e) => handleChange(idx, "lastName", e.target.value)}
                placeholder="Мартынюк"
                required
              />
            </div>
            <div className="form-field">
              <label>Имя</label>
              <input
                type="text"
                value={passenger.firstName}
                onChange={(e) => handleChange(idx, "firstName", e.target.value)}
                placeholder="Ирина"
                required
              />
            </div>
            <div className="form-field">
              <label>Отчество</label>
              <input
                type="text"
                value={passenger.patronymic}
                onChange={(e) =>
                  handleChange(idx, "patronymic", e.target.value)
                }
                placeholder="Эдуардовна"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field gender-field">
              <label>Пол</label>
              <div className="gender-buttons">
                <label className="gender-label">
                  <input
                    type="radio"
                    name={`gender-${idx}`}
                    value="M"
                    checked={passenger.gender === "M"}
                    onChange={() => handleChange(idx, "gender", "M")}
                  />
                  М
                </label>
                <label className="gender-label">
                  <input
                    type="radio"
                    name={`gender-${idx}`}
                    value="F"
                    checked={passenger.gender === "F"}
                    onChange={() => handleChange(idx, "gender", "F")}
                  />
                  Ж
                </label>
              </div>
            </div>
            <div className="form-field">
              <label>Дата рождения</label>
              <input
                type="date"
                value={passenger.birthDate}
                onChange={(e) => handleChange(idx, "birthDate", e.target.value)}
                required
              />
            </div>
            <div className="form-field checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={passenger.disability}
                  onChange={(e) =>
                    handleChange(idx, "disability", e.target.checked)
                  }
                />
                ограниченная подвижность
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Тип документа</label>
              <select
                value={passenger.documentType}
                onChange={(e) =>
                  handleChange(idx, "documentType", e.target.value)
                }
                className="document-select"
              >
                <option value="passport">Паспорт РФ</option>
                <option value="birthCert">Свидетельство о рождении</option>
              </select>
            </div>
            {passenger.documentType === "passport" && (
              <>
                <div className="form-field">
                  <label>Серия</label>
                  <input
                    type="text"
                    value={passenger.passportSeries}
                    onChange={(e) =>
                      handleChange(idx, "passportSeries", e.target.value)
                    }
                    placeholder="______"
                  />
                </div>
                <div className="form-field">
                  <label>Номер</label>
                  <input
                    type="text"
                    value={passenger.passportNumber}
                    onChange={(e) =>
                      handleChange(idx, "passportNumber", e.target.value)
                    }
                    placeholder="______"
                  />
                </div>
              </>
            )}
            {passenger.documentType === "birthCert" && (
              <div className="form-field">
                <label>Номер свидетельства</label>
                <input
                  type="text"
                  value={passenger.birthCertNumber}
                  onChange={(e) =>
                    handleChange(idx, "birthCertNumber", e.target.value)
                  }
                  placeholder="12 символов"
                  maxLength={12}
                />
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="submit-btn">
        <button type="submit">ДАЛЕЕ</button>
      </div>
    </form>
  );
}
