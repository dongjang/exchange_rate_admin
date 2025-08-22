import React, { useEffect, useState } from 'react';
import { FaGlobe, FaUniversity } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { api } from '../services/api';
import AdminCountryModal from './AdminCountryModal';
import AdminCountrySearchForm from './AdminCountrySearchForm';
import AdminBankModal from './AdminBankModal';
import AdminBankSearchForm from './AdminBankSearchForm';
import AdminLayout from './AdminLayout';
import AdminTable from './AdminTable';

interface Country {
  code: string;
  codeName: string;
  countryName: string;
}

interface CountrySearchRequest {
  select: string;
  countryName?: string;
  codeName?: string;
  code?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

interface BankSearchRequest {
  countryName?: string;
  bankName?: string;
  sortOrder?: string;
  page: number;
  size: number;
}

interface Bank {
  id?: number;
  name: string;
  bankCode?: string;
  currencyCode: string;
  countryName?: string;
  codeName?: string;
}

const AdminCountriesBanks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rates' | 'settings'>('rates');
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [searchRequest, setSearchRequest] = useState<CountrySearchRequest>({
    select: 'all',
    countryName: '',
    codeName: '',
    code: '',
    sortOrder: 'name',
    page: 0,
    size: 10
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 은행 관리 상태
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankLoading, setBankLoading] = useState(false);
  const [bankCurrentPage, setBankCurrentPage] = useState(1);
  const [bankTotalPages, setBankTotalPages] = useState(1);
  const [bankPageSize, setBankPageSize] = useState(10);
  const [bankTotalItems, setBankTotalItems] = useState(0);
  const [bankSearchRequest, setBankSearchRequest] = useState<BankSearchRequest>({
    countryName: '',
    bankName: '',
    sortOrder: 'bankName',
    page: 0,
    size: 10
  });
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [isBankEditMode, setIsBankEditMode] = useState(false);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await api.searchCountries(searchRequest);
      setCountries(response.content);
      setTotalItems(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('국가 목록 조회 실패:', error);
      setCountries([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rates') {
      fetchCountries();
    }
  }, [activeTab, searchRequest]);

  // 검색 조건이 변경될 때만 검색 실행 (페이지 변경 제외)
  useEffect(() => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  }, [searchRequest.select, searchRequest.countryName, searchRequest.codeName, searchRequest.code, searchRequest.sortOrder]);

  const handleSearch = () => {
    setSearchRequest(prev => ({ ...prev, page: 0 }));
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    // 페이지 범위 검증
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return;
    }
    setCurrentPage(page);
    setSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const handleCountryClick = (country: Country) => {
    setSelectedCountry(country);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (country: Country) => {
    const result = await Swal.fire({
      title: '국가 삭제',
      text: `${country.countryName} 국가를 삭제하시겠습니까? `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteCountry(country.code);
        await Swal.fire({
          title: '삭제 완료',
          text: '국가가 성공적으로 삭제되었습니다.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        fetchCountries();
      } catch (error) {
        console.error('국가 삭제 실패:', error);
        await Swal.fire({
          title: '삭제 실패',
          text: '국가 삭제에 실패했습니다.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleAddClick = () => {
    setSelectedCountry(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleModalSave = async (country: Country) => {
    const action = isEditMode ? '수정' : '등록';
    const result = await Swal.fire({
      title: `국가 ${action}`,
      text: `${country.countryName} 국가 정보를 ${action}하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: action,
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        if (isEditMode && selectedCountry) {
          await api.updateCountry(selectedCountry.code, country);
        } else {
          await api.createCountry(country);
        }
        
        await Swal.fire({
          title: `${action} 완료`,
          text: `국가가 성공적으로 ${action}되었습니다.`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        
        setIsModalOpen(false);
        fetchCountries();
      } catch (error) {
        console.error('국가 저장 실패:', error);
        await Swal.fire({
          title: `${action} 실패`,
          text: `국가 ${action}에 실패했습니다.`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
    setIsEditMode(false);
  };

  // 은행 관리 함수들
  const fetchBanks = async () => {
    try {
      setBankLoading(true);
      const response = await api.searchBanks(bankSearchRequest);
      setBanks(response.content);
      setBankTotalItems(response.totalElements);
      setBankTotalPages(response.totalPages);
    } catch (error) {
      console.error('은행 목록 조회 실패:', error);
      setBanks([]);
      setBankTotalItems(0);
      setBankTotalPages(0);
    } finally {
      setBankLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'settings') {
      fetchBanks();
    }
  }, [activeTab, bankSearchRequest]);

  useEffect(() => {
    setBankSearchRequest(prev => ({ ...prev, page: 0 }));
    setBankCurrentPage(1);
  }, [bankSearchRequest.countryName, bankSearchRequest.bankName, bankSearchRequest.sortOrder]);

  const handleBankSearch = () => {
    setBankSearchRequest(prev => ({ ...prev, page: 0 }));
    setBankCurrentPage(1);
  };

  const handleBankPageChange = (page: number) => {
    if (page < 1 || (bankTotalPages > 0 && page > bankTotalPages)) {
      return;
    }
    setBankCurrentPage(page);
    setBankSearchRequest(prev => ({ ...prev, page: (page - 1) * prev.size }));
  };

  const handleBankClick = (bank: Bank) => {
    setSelectedBank(bank);
    setIsBankEditMode(true);
    setIsBankModalOpen(true);
  };

  const handleBankDeleteClick = async (id: number) => {
    const result = await Swal.fire({
      title: '은행 삭제',
      text: '정말로 이 은행을 삭제하시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '삭제',
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        await api.deleteBank(id);
        await Swal.fire({
          title: '삭제 완료',
          text: '은행이 성공적으로 삭제되었습니다.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        fetchBanks();
      } catch (error) {
        console.error('은행 삭제 실패:', error);
        await Swal.fire({
          title: '삭제 실패',
          text: '은행 삭제에 실패했습니다.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleBankAddClick = () => {
    setSelectedBank(null);
    setIsBankEditMode(false);
    setIsBankModalOpen(true);
  };

  const handleBankModalSave = async (bank: Bank) => {
    const action = isBankEditMode ? '수정' : '등록';
    const result = await Swal.fire({
      title: `은행 ${action}`,
      text: `정말로 이 은행을 ${action}하시겠습니까?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: action,
      cancelButtonText: '취소'
    });

    if (result.isConfirmed) {
      try {
        if (isBankEditMode && selectedBank?.id) {
          await api.updateBank(selectedBank.id, bank);
        } else {
          await api.createBank(bank);
        }
        
        await Swal.fire({
          title: `${action} 완료`,
          text: `은행이 성공적으로 ${action}되었습니다.`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        
        setIsBankModalOpen(false);
        fetchBanks();
      } catch (error) {
        console.error('은행 저장 실패:', error);
        await Swal.fire({
          title: `${action} 실패`,
          text: `은행 ${action}에 실패했습니다.`,
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const handleBankModalClose = () => {
    setIsBankModalOpen(false);
    setSelectedBank(null);
    setIsBankEditMode(false);
  };

  const columns = [
    {
      key: 'countryName',
      label: '국가명',
      render: (value: any, country: Country) => {
        return (
          <span 
            style={{ 
              textDecoration: 'underline', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              color: '#007bff'
            }}
            onClick={() => handleCountryClick(country)}
          >
            {country.countryName}
          </span>
        );
      },
      align: 'left' as const
    },
    {
      key: 'codeName',
      label: '통화명',
      render: (value: any, country: Country) => country.codeName,
      align: 'left' as const
    },
    {
      key: 'code',
      label: '통화',
      render: (value: any, country: Country) => country.code,
      align: 'center' as const
    },
    {
      key: 'actions',
      label: '관리',
      render: (value: any, country: Country) => {
        return (
          <button
            onClick={() => handleDeleteClick(country)}
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
        );
      },
      align: 'center' as const
    }
  ];

  const bankColumns = [
    {
      key: 'name',
      label: '은행명',
      render: (value: any, bank: Bank) => {
        return (
          <span 
            style={{ 
              textDecoration: 'underline', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              color: '#007bff'
            }}
            onClick={() => handleBankClick(bank)}
          >
            {bank.name}
          </span>
        );
      },
      align: 'left' as const
    },
    {
      key: 'countryName',
      label: '국가명',
      render: (value: any, bank: Bank) => bank.countryName,
      align: 'left' as const
    },
    {
      key: 'codeName',
      label: '통화명',
      render: (value: any, bank: Bank) => bank.codeName,
      align: 'left' as const
    },
    {
      key: 'currencyCode',
      label: '통화',
      render: (value: any, bank: Bank) => bank.currencyCode,
      align: 'center' as const
    },
    {
      key: 'actions',
      label: '관리',
      render: (value: any, bank: Bank) => {
        return (
          <button
            onClick={() => handleBankDeleteClick(bank.id!)}
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
        );
      },
      align: 'center' as const
    }
  ];

  return (
    <AdminLayout>
      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'rates' ? 'active' : ''}`}
          onClick={() => setActiveTab('rates')}
        >
          <FaGlobe />
          <span>국가 관리</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <FaUniversity />
          <span>은행 관리</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'rates' && (
          <div className="tab-panel">
            <div className="panel-header">
              <h2>국가 관리</h2>
              <p>환율을 조회할 수 있는 국가 정보를 관리할 수 있습니다.</p>
            </div>
            <div className="panel-content">
                             {/* 검색 폼 */}
               <AdminCountrySearchForm
                 searchRequest={searchRequest}
                 setSearchRequest={setSearchRequest}
                 onSearch={handleSearch}
                 onAddClick={handleAddClick}
               />

              {/* 국가 테이블 */}
              <AdminTable
                data={countries}
                columns={columns}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalItems}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                emptyMessage="등록된 국가가 없습니다."
                showPagination={true}
                showPageSizeSelector={true}
                showSortSelector={true}
                sortOrder={searchRequest.sortOrder || 'name'}
                onPageSizeChange={(newPageSize) => {
                  setPageSize(newPageSize);
                  setSearchRequest(prev => ({ ...prev, size: newPageSize, page: 0 }));
                  setCurrentPage(1);
                }}
                onSortOrderChange={(newSortOrder) => {
                  setSearchRequest(prev => ({ ...prev, sortOrder: newSortOrder, page: 0 }));
                  setCurrentPage(1);
                }}
                sortOptions={[
                  { value: 'name', label: '이름순' },
                  { value: 'codeName', label: '통화명순' },
                  { value: 'code', label: '통화순' }
                ]}
                pageSizeOptions={[5, 10, 20, 50]}
              />
            </div>
          </div>
        )}

                 {activeTab === 'settings' && (
           <div className="tab-panel">
             <div className="panel-header">
               <h2>은행 관리</h2>
               <p>송금 가능한 은행 정보를 관리할 수 있습니다.</p>
             </div>
             <div className="panel-content">
               {/* 검색 폼 */}
               <AdminBankSearchForm
                 searchRequest={bankSearchRequest}
                 setSearchRequest={setBankSearchRequest}
                 onSearch={handleBankSearch}
                 onAddClick={handleBankAddClick}
               />

               {/* 은행 테이블 */}
               <AdminTable
                 data={banks}
                 columns={bankColumns}
                 currentPage={bankCurrentPage}
                 totalPages={bankTotalPages}
                 totalCount={bankTotalItems}
                 pageSize={bankPageSize}
                 onPageChange={handleBankPageChange}
                 emptyMessage="등록된 은행이 없습니다."
                 showPagination={true}
                 showPageSizeSelector={true}
                 showSortSelector={true}
                 sortOrder={bankSearchRequest.sortOrder || 'bankName'}
                 onPageSizeChange={(newPageSize) => {
                   setBankPageSize(newPageSize);
                   setBankSearchRequest(prev => ({ ...prev, size: newPageSize, page: 0 }));
                   setBankCurrentPage(1);
                 }}
                 onSortOrderChange={(newSortOrder) => {
                   setBankSearchRequest(prev => ({ ...prev, sortOrder: newSortOrder, page: 0 }));
                   setBankCurrentPage(1);
                 }}
                 sortOptions={[
                   { value: 'bankName', label: '은행명순' },
                   { value: 'countryName', label: '국가명순' }
                 ]}
                 pageSizeOptions={[5, 10, 20, 50]}
               />
             </div>
           </div>
         )}
      </div>

             <AdminCountryModal
         isOpen={isModalOpen}
         onClose={handleModalClose}
         onSave={handleModalSave}
         country={selectedCountry}
         isEdit={isEditMode}
       />

       <AdminBankModal
         isOpen={isBankModalOpen}
         onClose={handleBankModalClose}
         onSave={handleBankModalSave}
         bank={selectedBank}
         isEdit={isBankEditMode}
       />
    </AdminLayout>
  );
};

export default AdminCountriesBanks;
