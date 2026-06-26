import { useCreditorsQuery } from '../../queries';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { AddCreditorModal } from '../../components/features/creditors/AddCreditorModal';
import { ViewCreditorModal } from '../../components/features/creditors/ViewCreditorModal';
import { EditCreditorModal } from '../../components/features/creditors/EditCreditorModal';
import { DeleteCreditorModal } from '../../components/features/creditors/DeleteCreditorModal';
import { useState } from 'react';
import { Trash2, Eye, Edit2, Plus } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function CreditorsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewCreditorId, setViewCreditorId] = useState<string | null>(null);
  const [editCreditorId, setEditCreditorId] = useState<string | null>(null);
  const [deleteCreditorId, setDeleteCreditorId] = useState<string | null>(null);
  const [selectedCreditorName, setSelectedCreditorName] = useState('');
  const debouncedSearch = useDebouncedValue(search, 350);
  const { data, isLoading } = useCreditorsQuery(page, 10, debouncedSearch, 'active');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Borrowers</h1>
          <button 
            onClick={() => setAddModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
            <Plus size={18} />
            Add Borrower
          </button>
        </div>

        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search borrowers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-12 text-center text-slate-500">Loading...</div>
        ) : (
          <>
          <div className="space-y-3 md:hidden">
            {data?.data?.map((creditor: any) => {
              const fullName = [creditor.firstName, creditor.middleName, creditor.lastName]
                .filter(Boolean)
                .join(' ');
              const creditorDisplayName = [creditor.firstName, creditor.middleName, creditor.lastName]
                .filter(Boolean)
                .join(' ');

              return (
                <article key={creditor.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{fullName}</p>
                      <p className="mt-1 text-sm text-slate-600">{creditor.contactNumber}</p>
                      <p className="text-sm text-slate-600">{creditor.email}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {creditor.status}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setViewCreditorId(creditor.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700"
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => setEditCreditorId(creditor.id)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteCreditorId(creditor.id);
                        setSelectedCreditorName(creditorDisplayName);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Contact</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.data?.map((creditor: any) => {
                  const fullName = [creditor.firstName, creditor.middleName, creditor.lastName]
                    .filter(Boolean)
                    .join(' ');
                  const creditorDisplayName = [creditor.firstName, creditor.middleName, creditor.lastName]
                    .filter(Boolean)
                    .join(' ');
                  return (
                  <tr key={creditor.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-800">{fullName}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{creditor.contactNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{creditor.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {creditor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setViewCreditorId(creditor.id)}
                          className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-800"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button 
                          onClick={() => setEditCreditorId(creditor.id)}
                          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-800"
                        >
                          <Edit2 size={16} />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            setDeleteCreditorId(creditor.id);
                            setSelectedCreditorName(creditorDisplayName);
                          }}
                          className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex justify-center space-x-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-700">Page {page}</span>
          <button
            disabled={!data?.hasMore}
            onClick={() => setPage(page + 1)}
            className="rounded-lg border border-slate-300 px-4 py-2 disabled:opacity-50"
          >
            Next
          </button>
        </div>

        {/* Modals */}
        <AddCreditorModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
        <ViewCreditorModal isOpen={!!viewCreditorId} onClose={() => setViewCreditorId(null)} creditorId={viewCreditorId} />
        <EditCreditorModal isOpen={!!editCreditorId} onClose={() => setEditCreditorId(null)} creditorId={editCreditorId} />
        <DeleteCreditorModal 
          isOpen={!!deleteCreditorId} 
          onClose={() => setDeleteCreditorId(null)} 
          creditorId={deleteCreditorId}
          creditorName={selectedCreditorName}
        />
      </div>
    </AdminLayout>
  );
}
