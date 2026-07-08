import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { mockDb, type Transaction, type BankAccount } from '../services/mockDb';
import { 
  Card, Add, ArrowDown, ArrowUp, 
  Clock, Bank 
} from 'iconsax-react';
import { 
  TextField, Label, Input, 
  Select, SelectTrigger, SelectValue, SelectPopover, ListBox, ListBoxItem,
  Button, Modal, ModalBackdrop, ModalContainer, ModalDialog, ModalBody, ModalHeader, ModalFooter, Spinner, toast 
} from '@heroui/react';

export const Wallet: React.FC = () => {
  const { user, wallet, refreshWallet } = useAppStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  
  // Modals
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState('10000');
  const [cardNum, setCardNum] = useState('4321 •••• •••• 9876');
  
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('5000');
  const [selectedBankId, setSelectedBankId] = useState('');
  
  const [showAddBank, setShowAddBank] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accName, setAccName] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Sync local component state with DB
      setTransactions(mockDb.getTransactions(user.id));
      const banks = mockDb.getBankAccounts(user.id);
      setBankAccounts(banks);
      if (banks.length > 0 && !selectedBankId) {
        setSelectedBankId(banks[0].id);
      }
    }
  }, [user, wallet]);

  if (!user) return null;

  const handleAddMoney = () => {
    const amt = parseFloat(addAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.warning('Please enter a valid amount.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      mockDb.creditWallet(user.id, amt, `Top-up via Card (*${cardNum.slice(-4)})`, `TX-${Math.floor(100000 + Math.random() * 900000)}`);
      refreshWallet();
      toast.success('Funds added successfully!');
      setLoading(false);
      setShowAddMoney(false);
      setAddAmount('10000');
    }, 1500);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.warning('Please enter a valid amount.');
      return;
    }

    if (!wallet || wallet.balance < amt) {
      toast.danger('Insufficient funds in wallet ledger.');
      return;
    }

    const bank = bankAccounts.find(b => b.id === selectedBankId);
    if (!bank) {
      toast.warning('Please select a destination bank.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      mockDb.deductWallet(user.id, amt, `Withdrawal to ${bank.bankName}`, `TX-${Math.floor(100000 + Math.random() * 900000)}`);
      refreshWallet();
      toast.success('Withdrawal processed successfully!');
      setLoading(false);
      setShowWithdraw(false);
      setWithdrawAmount('5000');
    }, 1500);
  };

  const handleAddBank = () => {
    if (!bankName || !accNumber || !accName) {
      toast.warning('Please fill in all bank details.');
      return;
    }

    if (accNumber.length !== 10) {
      toast.warning('Account number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      mockDb.addBankAccount(user.id, bankName, accNumber, accName);
      refreshWallet(); // triggers re-render of linked banks
      toast.success('Bank account linked successfully!');
      setLoading(false);
      setShowAddBank(false);
      setBankName('');
      setAccNumber('');
      setAccName('');
    }, 1200);
  };

  const getTxColor = (type: string, direction: Transaction['direction']) => {
    if (type === 'escrow_lock') return 'text-amber-400';
    if (type === 'escrow_release') return 'text-success-400';
    return direction === 'credit' ? 'text-success-400' : 'text-zinc-400';
  };

  const getTxSymbol = (direction: Transaction['direction']) => {
    return direction === 'credit' ? '+' : '-';
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-6 bg-zinc-955 text-left animate-in fade-in pb-20">
      <h2 className="text-2xl font-extrabold text-white mb-2">Ledger Balance</h2>
      <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
        Deposit funds into your multi-sig escrow, query pending payouts, and request instant bank settlement.
      </p>

      {/* Balance Card */}
      <div className="glass border border-brand-500/20 bg-gradient-to-br from-brand-600/20 via-brand-700/5 to-zinc-950 p-6 rounded-[32px] flex flex-col justify-between h-44 mb-6 shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-brand-500/10 blur-2xl pointer-events-none"></div>
        
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] text-zinc-450 font-bold uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-3xl font-extrabold tracking-tight text-white block mt-1">
              ₦{wallet?.balance.toLocaleString()}
            </span>
          </div>
          <Card size={24} color="currentColor" variant="Broken" className="text-brand-400" />
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex-1 flex items-center justify-center gap-1 font-bold h-9 bg-white hover:bg-zinc-100 text-brand-600 rounded-xl transition-all text-xs"
            onClick={() => setShowAddMoney(true)}
          >
            <Add size={16} color="currentColor" variant="Broken" />
            <span>Add Money</span>
          </Button>
          <Button 
            className="flex-1 flex items-center justify-center gap-1 font-bold h-9 border border-white/30 text-white hover:bg-white/10 rounded-xl transition-all text-xs bg-transparent"
            onClick={() => setShowWithdraw(true)}
          >
            <ArrowUp size={16} color="currentColor" variant="Broken" />
            <span>Withdraw</span>
          </Button>
        </div>
      </div>

      {/* Bank accounts section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider">Bank Accounts</h3>
          <Button 
            onClick={() => setShowAddBank(true)}
            className="text-[10px] text-brand-400 font-bold hover:underline flex items-center gap-0.5 p-0 h-auto min-w-0 bg-transparent"
          >
            <Add size={12} color="currentColor" variant="Broken" /> Add Bank
          </Button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
          {bankAccounts.length === 0 ? (
            <div className="glass border border-zinc-900 rounded-2xl p-4 text-center text-zinc-500 text-xs flex-1 font-light">
              No bank account linked.
            </div>
          ) : (
            bankAccounts.map(bank => (
              <div 
                key={bank.id} 
                className={`p-3.5 border rounded-2xl glass flex items-center gap-3 w-56 shrink-0 transition-all cursor-pointer ${selectedBankId === bank.id ? 'border-brand-500 bg-brand-500/5' : 'border-zinc-850'}`}
                onClick={() => setSelectedBankId(bank.id)}
              >
                <Bank size={18} color="currentColor" variant="Broken" className="text-brand-400" />
                <div className="text-left min-w-0 flex-1">
                  <span className="font-bold text-xs text-white block truncate">{bank.bankName}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">•••• {bank.accountNumber.slice(-4)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ledger Transactions */}
      <div className="flex-1 flex flex-col">
        <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-4 flex items-center gap-1">
          <Clock size={14} color="currentColor" variant="Broken" className="text-brand-400" /> Transaction Ledger
        </h3>
        
        <div className="flex flex-col gap-3">
          {transactions.length === 0 ? (
            <div className="glass border border-zinc-900 rounded-3xl p-8 text-center text-zinc-500 text-xs">
              No ledger transactions recorded yet.
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="p-3 border border-zinc-855 bg-zinc-900/10 rounded-2xl flex justify-between items-center gap-4 text-xs animate-in fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-400 shrink-0">
                    {tx.direction === 'credit' ? <ArrowDown size={16} color="currentColor" variant="Broken" className="text-success-400" /> : <ArrowUp size={16} color="currentColor" variant="Broken" className="text-zinc-400" />}
                  </div>
                  <div className="text-left min-w-0">
                    <span className="font-bold text-white block truncate w-44">{tx.description}</span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">
                      {new Date(tx.createdAt).toLocaleDateString()} · {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <span className={`font-black text-right shrink-0 ${getTxColor(tx.type, tx.direction)}`}>
                  {getTxSymbol(tx.direction)}₦{tx.amount.toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ADD MONEY TOP-UP MODAL (PAY-2) */}
      <Modal isOpen={showAddMoney} onOpenChange={(open) => { if (!open) setShowAddMoney(false); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-955 border border-zinc-800 max-w-sm w-full rounded-[28px] p-6 text-white">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-left pr-4 mt-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Wallet Top-up</span>
                <h3 className="text-lg font-extrabold text-white mt-1">Load Wallet Balance</h3>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 text-left">
                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Amount (₦)</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="number"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={addAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddAmount(e.target.value)}
                    />
                  </div>
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Select Card</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="text"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={cardNum}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCardNum(e.target.value)}
                    />
                  </div>
                </TextField>
              </ModalBody>
              <ModalFooter className="flex gap-3 pb-6">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 transition-colors text-xs bg-transparent"
                  onClick={() => setShowAddMoney(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  onClick={handleAddMoney}
                  isDisabled={loading}
                >
                  {loading && <Spinner size="sm" />}
                  Confirm Top-up
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

      {/* WITHDRAW MONEY MODAL (PAY-4) */}
      <Modal isOpen={showWithdraw} onOpenChange={(open) => { if (!open) setShowWithdraw(false); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-955 border border-zinc-800 max-w-sm w-full rounded-[28px] p-6 text-white">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-left pr-4 mt-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Withdraw Payout</span>
                <h3 className="text-lg font-extrabold text-white mt-1">Transfer to Bank Account</h3>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 text-left">
                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Amount to withdraw (₦)</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="number"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={withdrawAmount}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWithdrawAmount(e.target.value)}
                    />
                  </div>
                </TextField>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Destination Bank Account</span>
                  {bankAccounts.length === 0 ? (
                    <span className="text-xs text-danger font-semibold">Please link a bank account first.</span>
                  ) : (
                    <Select selectedKey={selectedBankId} onSelectionChange={(key) => setSelectedBankId(key as string)}>
                      <SelectTrigger className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white flex justify-between items-center">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopover className="bg-zinc-955 border border-zinc-850 rounded-xl p-1 text-white z-50">
                        <ListBox className="outline-none">
                          {bankAccounts.map(b => (
                            <ListBoxItem id={b.id} textValue={`${b.bankName} - ${b.accountNumber}`} className="p-2 text-xs text-zinc-300 hover:text-white hover:bg-brand-500 rounded-lg cursor-pointer outline-none">
                              {b.bankName} - {b.accountNumber}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </SelectPopover>
                    </Select>
                  )}
                </div>
              </ModalBody>
              <ModalFooter className="flex gap-3 pb-6">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 transition-colors text-xs bg-transparent"
                  onClick={() => setShowWithdraw(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  onClick={handleWithdraw}
                  isDisabled={loading || bankAccounts.length === 0}
                >
                  {loading && <Spinner size="sm" />}
                  Confirm Payout
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

      {/* ADD BANK ACCOUNT MODAL (GEN-5) */}
      <Modal isOpen={showAddBank} onOpenChange={(open) => { if (!open) setShowAddBank(false); }}>
        <ModalBackdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <ModalContainer className="bg-zinc-955 border border-zinc-800 max-w-sm w-full rounded-[28px] p-6 text-white">
            <ModalDialog className="outline-none">
              <ModalHeader className="flex flex-col gap-1 text-left pr-4 mt-2">
                <span className="text-xs uppercase font-extrabold tracking-widest text-brand-400">Add Account</span>
                <h3 className="text-lg font-extrabold text-white mt-1">Link Bank Account</h3>
              </ModalHeader>
              <ModalBody className="flex flex-col gap-4 text-left">
                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Bank Name</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="text"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={bankName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBankName(e.target.value)}
                    />
                  </div>
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Account Number</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="text"
                      placeholder="10-digit account number"
                      maxLength={10}
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={accNumber}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccNumber(e.target.value)}
                    />
                  </div>
                </TextField>

                <TextField className="flex flex-col gap-1.5 w-full">
                  <Label className="text-zinc-400 text-xs font-semibold">Account Holder Name</Label>
                  <div className="flex items-center gap-2.5 px-3.5 py-3 border border-zinc-800 rounded-xl bg-zinc-900/50 focus-within:border-brand-500 h-11 transition-colors">
                    <Input
                      type="text"
                      placeholder="Name matches bank record"
                      className="w-full bg-transparent text-xs text-white focus:outline-none"
                      value={accName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccName(e.target.value)}
                    />
                  </div>
                </TextField>
              </ModalBody>
              <ModalFooter className="flex gap-3 pb-6">
                <Button 
                  className="flex-1 h-11 border border-zinc-800 text-zinc-400 font-bold rounded-xl hover:bg-zinc-900 transition-colors text-xs bg-transparent"
                  onClick={() => setShowAddBank(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 h-11 font-bold bg-brand-500 hover:bg-brand-600 text-white rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                  onClick={handleAddBank}
                  isDisabled={loading}
                >
                  {loading && <Spinner size="sm" />}
                  Save Account
                </Button>
              </ModalFooter>
            </ModalDialog>
          </ModalContainer>
        </ModalBackdrop>
      </Modal>

    </div>
  );
};

export default Wallet;
