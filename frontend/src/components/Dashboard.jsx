import React, { useEffect, useState } from 'react';
import { getPatients, getObservations, api } from '../api';
import { Users, LogOut, ChevronRight, Activity, Calendar, User as UserIcon, Plus, HeartPulse, UserPlus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = ({ onLogout }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [observations, setObservations] = useState([]);
  
  // États Observation
  const [newVal, setNewVal] = useState('');
  const [obsType, setObsType] = useState('heart-rate');

  // États pour nouveau patient
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    family_name: '',
    given_name: '',
    gender: 'male',
    birth_date: ''
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data } = await getPatients();
      setPatients(data.results || data);
    } catch (err) {
      console.error("Erreur patients", err);
    }
  };

  const handleSelectPatient = async (patient) => {
    setSelectedPatient(patient);
    setShowPatientForm(false);
    try {
      const { data } = await getObservations(patient.id);
      setObservations(data.results || data);
    } catch (err) {
      console.error("Erreur observations", err);
    }
  };

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patients/', {
        resourceType: "Patient",
        name: [{ family: newPatient.family_name, given: [newPatient.given_name] }],
        gender: newPatient.gender,
        birthDate: newPatient.birth_date
      });
      setNewPatient({ family_name: '', given_name: '', gender: 'male', birth_date: '' });
      setShowPatientForm(false);
      fetchPatients();
    } catch (err) {
      const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : "Vérifiez votre connexion";
      alert("Erreur de création: " + errorMsg);
    }
  };

  const handleAddObservation = async (e) => {
    e.preventDefault();
    if (!selectedPatient || !newVal) return;

    const unitMap = {
      'heart-rate': 'bpm',
      'temperature': '°C',
      'blood-pressure': 'mmHg',
      'weight': 'kg',
      'height': 'cm'
    };

    try {
      // Correction ici : 'patient' au lieu de 'patient_id'
      await api.post('/observations/', {
        patient: selectedPatient.id,
        observation_type: obsType,
        value: newVal,
        unit: unitMap[obsType],
        effective_date: new Date().toISOString()
      });
      setNewVal('');
      handleSelectPatient(selectedPatient);
    } catch (err) {
      alert("Erreur lors de l'enregistrement de l'observation.");
    }
  };

  const getPatientDisplayName = (p) => {
    if (!p) return "";
    if (p.name && p.name[0]) {
      const family = p.name[0].family || "";
      const given = p.name[0].given ? p.name[0].given[0] : "";
      return `${given} ${family}`.toUpperCase();
    }
    return `${p.given_name} ${p.family_name}`.toUpperCase();
  };

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-indigo-950 text-white flex flex-col shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Activity size={28} className="text-white" />
          </div>
          <div>
            <span className="block font-black text-xl">FHIR HUB</span>
            <span className="text-[10px] font-bold text-blue-400">Interopérabilité</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-4">
          <button 
            onClick={() => { setShowPatientForm(false); setSelectedPatient(null); fetchPatients(); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${(!showPatientForm && !selectedPatient) ? 'bg-white/10 text-white' : 'text-indigo-300'}`}
          >
            <Users size={22} />
            <span>Patients</span>
          </button>
          
          <button 
            onClick={() => { setShowPatientForm(true); setSelectedPatient(null); }}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${showPatientForm ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-indigo-300 hover:bg-white/5'}`}
          >
            <UserPlus size={22} />
            <span>Nouveau Patient</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-4 text-indigo-300 hover:text-white rounded-2xl hover:bg-white/5 transition-all">
            <LogOut size={20} />
            <span className="font-bold">Quitter</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex overflow-hidden">
        {/* Liste Patients */}
        <div className="w-[380px] border-r border-slate-200 flex flex-col bg-white">
          <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h1 className="text-2xl font-black text-slate-800">Répertoire</h1>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black">{patients.length}</span>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {patients.map(p => (
              <button 
                key={p.id}
                onClick={() => handleSelectPatient(p)}
                className={`w-full p-6 flex items-center gap-5 hover:bg-indigo-50/50 transition-all border-b border-slate-50 ${selectedPatient?.id === p.id ? 'bg-indigo-50 border-r-4 border-indigo-600' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${selectedPatient?.id === p.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-100 text-slate-400'}`}>
                  {getPatientDisplayName(p).charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-800 leading-tight">{getPatientDisplayName(p)}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-wider">{p.gender}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Espace Formulaire ou Détails */}
        <div className="flex-1 bg-slate-50/30 overflow-y-auto">
          {showPatientForm ? (
            <div className="p-12 max-w-3xl mx-auto">
              <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-200">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ajouter un nouveau Patient</h2>
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><UserPlus size={24} /></div>
                </div>
                
                <form onSubmit={handleCreatePatient} className="grid grid-cols-2 gap-8">
                   <div className="col-span-1 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                      <input 
                        required
                        type="text" 
                        value={newPatient.given_name}
                        onChange={(e) => setNewPatient({...newPatient, given_name: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-blue-500 transition-all focus:bg-white"
                        placeholder="Ex: Sabri"
                      />
                   </div>
                   <div className="col-span-1 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom de famille</label>
                      <input 
                        required
                        type="text" 
                        value={newPatient.family_name}
                        onChange={(e) => setNewPatient({...newPatient, family_name: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-blue-500 transition-all focus:bg-white"
                        placeholder="Ex: Barbaria"
                      />
                   </div>
                   <div className="col-span-1 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Genre</label>
                      <select 
                        value={newPatient.gender}
                        onChange={(e) => setNewPatient({...newPatient, gender: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-blue-500 transition-all cursor-pointer focus:bg-white"
                      >
                        <option value="male">Homme (Male)</option>
                        <option value="female">Femme (Female)</option>
                        <option value="other">Autre (Other)</option>
                      </select>
                   </div>
                   <div className="col-span-1 space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date de naissance</label>
                      <input 
                        required
                        type="date" 
                        value={newPatient.birth_date}
                        onChange={(e) => setNewPatient({...newPatient, birth_date: e.target.value})}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold outline-none focus:border-blue-500 transition-all focus:bg-white"
                      />
                   </div>
                   <div className="col-span-2 mt-4">
                      <button type="submit" className="w-full py-5 bg-blue-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-blue-200 transition-all transform hover:-translate-y-1 active:scale-95">
                        Transmettre au format HL7 FHIR R4
                      </button>
                   </div>
                </form>
              </div>
            </div>
          ) : selectedPatient ? (
            <div className="p-12 max-w-6xl mx-auto space-y-10">
              {/* Header Patient */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden bg-gradient-to-r from-white to-slate-50/50">
                <div className="flex items-center gap-10">
                  <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center text-3xl font-black shadow-xl shadow-indigo-100">
                    {getPatientDisplayName(selectedPatient).charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{getPatientDisplayName(selectedPatient)}</h2>
                    <div className="flex gap-4 mt-3">
                      <span className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100/50 font-bold"><Calendar size={18} /> {selectedPatient.birthDate || selectedPatient.birth_date}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Formulaire ajout mesure */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 flex flex-col">
                   <h3 className="text-lg font-black mb-6 flex items-center gap-3">
                     <Plus className="text-indigo-600 bg-indigo-50 p-1.5 rounded-lg" /> Nouvelle Constante
                   </h3>
                   <form onSubmit={handleAddObservation} className="space-y-6 flex-1 flex flex-col justify-center">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Type de mesure</label>
                        <select 
                          value={obsType} 
                          onChange={(e) => setObsType(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-4 px-5 font-bold outline-none focus:border-indigo-500 focus:bg-white"
                        >
                          <option value="heart-rate">Rythme Cardiaque</option>
                          <option value="temperature">Température</option>
                          <option value="blood-pressure">Tension</option>
                          <option value="weight">Poids</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-2">Valeur</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={newVal} 
                          onChange={(e) => setNewVal(e.target.value)}
                          className="w-full bg-slate-50 border-2 border-slate-50 rounded-xl py-5 font-black text-4xl text-indigo-600 text-center outline-none focus:border-indigo-500 focus:bg-white"
                          placeholder="0.0"
                        />
                      </div>
                      <button type="submit" className="w-full py-5 mt-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95">
                        Enregistrer
                      </button>
                   </form>
                </div>

                {/* Graphique */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
                  <h3 className="text-xl font-black mb-8 flex items-center gap-3"><Activity className="text-red-500" /> Analyse Graphique</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={observations.filter(o => (o.code?.text || o.observation_type) === obsType).map(o => ({ 
                        date: new Date(o.effectiveDateTime || o.effective_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), 
                        value: o.valueQuantity ? o.valueQuantity.value : o.value 
                      })).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} fontWeight={700} tickMargin={10} />
                        <YAxis stroke="#94a3b8" fontSize={12} fontWeight={700} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Line type="monotone" dataKey="value" stroke="#4f46e5" strokeWidth={5} dot={{ r: 6, fill: '#4f46e5', strokeWidth: 4, stroke: '#fff' }} activeDot={{ r: 10 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-6">
              <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center shadow-inner border border-slate-100">
                <Users size={64} className="opacity-10" />
              </div>
              <p className="text-2xl font-black italic opacity-50 tracking-tight">Prêt pour l'interopérabilité médicale</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
