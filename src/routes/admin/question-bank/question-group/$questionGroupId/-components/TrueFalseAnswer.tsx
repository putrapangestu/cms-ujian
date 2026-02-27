import React from 'react';
import { type UseFormRegister, type UseFormWatch } from 'react-hook-form';

interface TrueFalseProps {
  register: UseFormRegister<any>;
  watch: UseFormWatch<any>;
  name: string;
}

const TrueFalseAnswer: React.FC<TrueFalseProps> = ({ register, watch, name }) => {
  const selectedValue = watch(name);

  return (
    <div className="mb-5">
      <label className="form-label fw-semibold mb-3">Kunci Jawaban</label>
      <div className="row g-3">
        {/* Opsi BENAR */}
        <div className="col-md-6">
          <label
            className={`card border-2 h-100 cursor-pointer transition-all ${
              selectedValue === 'true'
                ? 'border-success bg-success bg-opacity-10 shadow-sm'
                : 'border-light bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body text-center p-4">
              <div
                className="bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '64px', height: '64px' }}
              >
                <i className="ti ti-check text-success fs-1"></i>
              </div>
              <h5 className="fw-bold text-success mb-0">BENAR</h5>
              <input
                type="radio"
                className="form-check-input mt-3"
                value="true"
                {...register(name)}
              />
            </div>
          </label>
        </div>

        {/* Opsi SALAH */}
        <div className="col-md-6">
          <label
            className={`card border-2 h-100 cursor-pointer transition-all ${
              selectedValue === 'false'
                ? 'border-danger bg-danger bg-opacity-10 shadow-sm'
                : 'border-light bg-white'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <div className="card-body text-center p-4">
              <div
                className="bg-danger bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '64px', height: '64px' }}
              >
                <i className="ti ti-x text-danger fs-1"></i>
              </div>
              <h5 className="fw-bold text-danger mb-0">SALAH</h5>
              <input
                type="radio"
                className="form-check-input mt-3"
                value="false"
                {...register(name)}
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default TrueFalseAnswer;