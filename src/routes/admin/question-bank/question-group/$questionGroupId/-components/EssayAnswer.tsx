import RichEditor from '@/components/RichEditor';
import React from 'react';
import { Controller, type Control } from 'react-hook-form';
// Pastikan path RichEditor sudah sesuai dengan struktur project Anda

interface EssayAnswerProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
}

const EssayAnswer: React.FC<EssayAnswerProps> = ({ 
  control, 
  name, 
  label = "Kunci Jawaban / Pedoman Penskoran",
  placeholder = "Berikan panduan atau poin-poin penting untuk penilaian..." 
}) => {
  return (
    <div className="mb-5">
      <label className="form-label fw-semibold d-flex align-items-center">
        {label}
        <span className="badge bg-secondary bg-opacity-10 text-secondary ms-2 fw-normal">
          Opsional
        </span>
      </label>
      
      <div className="card border-light shadow-sm overflow-hidden">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <RichEditor
              content={field.value || ''}
              onChange={field.onChange}
              placeholder={placeholder}
            />
          )}
        />
      </div>

      <div className="alert alert-light border-0 py-2 px-0 mt-1 mb-0">
        <small className="text-muted d-flex align-items-center gap-1">
          <i className="ti ti-info-circle text-info"></i>
          Berikan panduan untuk memudahkan penilaian jawaban essay secara manual maupun otomatis.
        </small>
      </div>
    </div>
  );
};

export default EssayAnswer;
