import React from 'react';

interface Country {
  code: string;
  codeName: string;
  countryName: string;
}

interface AdminCountryTableProps {
  countries: Country[];
  onCountryClick: (country: Country) => void;
  onDeleteClick: (code: string) => void;
  loading?: boolean;
}

const AdminCountryTable: React.FC<AdminCountryTableProps> = ({
  countries,
  onCountryClick,
  onDeleteClick,
  loading = false
}) => {
  if (loading) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '16px'
      }}>
        데이터를 불러오는 중...
      </div>
    );
  }

  if (countries.length === 0) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '16px'
      }}>
        등록된 국가가 없습니다.
      </div>
    );
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse'
      }}>
        <thead>
          <tr style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <th style={{
              padding: '16px 20px',
              textAlign: 'left',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              width: '30%'
            }}>
              국가명
            </th>
            <th style={{
              padding: '16px 20px',
              textAlign: 'left',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              width: '30%'
            }}>
              통화명
            </th>
            <th style={{
              padding: '16px 20px',
              textAlign: 'left',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              width: '20%'
            }}>
              통화
            </th>
            <th style={{
              padding: '16px 20px',
              textAlign: 'center',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px',
              width: '20%'
            }}>
              관리
            </th>
          </tr>
        </thead>
        <tbody>
          {countries.map((country, index) => (
            <tr
              key={country.code}
              style={{
                borderBottom: index < countries.length - 1 ? '1px solid #f1f5f9' : 'none',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <td
                style={{
                  padding: '16px 20px',
                  color: '#1f2937',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                onClick={() => onCountryClick(country)}
              >
                {country.countryName}
              </td>
              <td style={{
                padding: '16px 20px',
                color: '#1f2937',
                fontSize: '14px'
              }}>
                {country.codeName}
              </td>
              <td style={{
                padding: '16px 20px',
                color: '#1f2937',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                {country.code}
              </td>
              <td style={{
                padding: '16px 20px',
                textAlign: 'center'
              }}>
                <button
                  onClick={() => onDeleteClick(country.code)}
                  style={{
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminCountryTable;
