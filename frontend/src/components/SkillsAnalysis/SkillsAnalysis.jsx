import React, { useState } from 'react';
import {
  CheckCircle2, XCircle, Target, AlertTriangle,
  ChevronDown, ChevronUp, TrendingUp, Award, AlertCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SkillsAnalysis = ({ data }) => {
  const [expanded, setExpanded] = useState({ tech: false, soft: false });

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
        <AlertCircle size={32} />
        <p>No skill analysis data available.</p>
      </div>
    );
  }

  const {
    overall_match_percentage = 0,
    similarity_score = 0,
    match_category = '',
    matching_skills = [],
    missing_skills = [],
    skills_gap_analysis = {},
    selection_probability = 0,
    selection_reasoning = '',
    key_strengths = [],
    areas_of_improvement = []
  } = data;

  const score = parseFloat(overall_match_percentage) || similarity_score;
  const scoreColor = getColor(score);
  const selectionScore = parseFloat(selection_probability) || score;

  const chartData = [
    { name: 'Matching', value: matching_skills.length, color: '#48bb78' },
    { name: 'Missing', value: missing_skills.length, color: '#f56565' },
  ];

  function getColor(num) {
    if (num >= 80) return '#48bb78';
    if (num >= 65) return '#4299e1';
    if (num >= 50) return '#ed8936';
    return '#f56565';
  }

  const toggle = (section) =>
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));

  const parseList = (val) =>
    typeof val === 'string'
      ? val.split(',').map((v) => v.trim()).filter(Boolean)
      : Array.isArray(val)
      ? val
      : [];

  const strengths = parseList(key_strengths);
  const improvements = parseList(areas_of_improvement);

  return (
    <div style={{ animation: 'fadeIn 0.5s ease', fontFamily: 'system-ui, sans-serif' }}>
      {/* Top Summary Section */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginBottom: '2rem' }}>
        <InfoCard
          title="Overall Match"
          icon={<Target size={28} color={scoreColor} />}
          value={`${score}%`}
          subText={match_category}
          color={scoreColor}
          message={
            score >= 80 ? '🎯 Excellent Match' :
            score >= 65 ? '👍 Good Match' :
            score >= 50 ? '⚠️ Moderate Match' :
            '📚 Needs Improvement'
          }
        />

        <InfoCard
          title="Selection Probability"
          icon={<TrendingUp size={28} color={getColor(selectionScore)} />}
          value={`${selectionScore}%`}
          color={getColor(selectionScore)}
          message={selection_reasoning}
        />

        <ChartCard data={chartData} />
      </div>

      {/* Strengths + Improvements */}
      <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '2rem' }}>
        {strengths.length > 0 && <ListCard title="Key Strengths" color="#48bb78" icon={<Award size={18} />} items={strengths} />}
        {improvements.length > 0 && <ListCard title="Areas to Improve" color="#ed8936" icon={<AlertCircle size={18} />} items={improvements} />}
      </div>

      {/* Matching + Missing Skills */}
      <SkillGroup title="Matching Skills" color="#48bb78" skills={matching_skills} icon={<CheckCircle2 size={18} />} />
      <SkillGroup title="Skills to Develop" color="#f56565" skills={missing_skills} icon={<XCircle size={18} />} />

      {/* Collapsible Gap Analysis */}
      {(skills_gap_analysis.technical_skills || skills_gap_analysis.soft_skills) && (
        <div style={card}>
          <Header icon={<AlertTriangle size={20} color="#ed8936" />} title="Detailed Skills Gap Analysis" />
          {skills_gap_analysis.technical_skills && (
            <CollapseSection
              title="💻 Technical Skills Gap"
              expanded={expanded.tech}
              onToggle={() => toggle('tech')}
              bg="#fef3c7"
              content={skills_gap_analysis.technical_skills}
            />
          )}
          {skills_gap_analysis.soft_skills && (
            <CollapseSection
              title="🤝 Soft Skills Gap"
              expanded={expanded.soft}
              onToggle={() => toggle('soft')}
              bg="#dbeafe"
              content={skills_gap_analysis.soft_skills}
            />
          )}
        </div>
      )}
    </div>
  );
};

/* ------------------ Small Subcomponents ------------------ */

const InfoCard = ({ title, icon, value, subText, message, color }) => (
  <div style={{ ...card, borderLeft: `6px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>{title}</h3>
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', fontWeight: 700, color }}>{value}</div>
      {subText && <p style={{ color: '#718096', fontSize: '0.9rem', margin: 0 }}>{subText}</p>}
      {message && (
        <p style={{ background: '#f7fafc', borderRadius: '8px', padding: '0.5rem', color: '#4a5568', fontSize: '0.85rem' }}>
          {message}
        </p>
      )}
    </div>
  </div>
);

const ChartCard = ({ data }) => (
  <div style={card}>
    <h3 style={{ marginBottom: '0.75rem', color: '#2d3748' }}>Skills Distribution</h3>
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={35} outerRadius={55} paddingAngle={4}>
          {data.map((d, i) => <Cell key={i} fill={d.color} />)}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.85rem', color: '#4a5568' }}>
      {data.map((d) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
          {d.name}: {d.value}
        </div>
      ))}
    </div>
  </div>
);

const ListCard = ({ title, color, icon, items }) => (
  <div style={{ ...card, borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>{title}</h3>
    </div>
    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#4a5568', fontSize: '0.85rem', lineHeight: 1.7 }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  </div>
);

const SkillGroup = ({ title, skills, color, icon }) => (
  <div style={card}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color }}>
      {icon}
      <h3 style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>
        {title} ({skills.length})
      </h3>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
      {skills.map((skill, idx) => {
        const name = skill.skill_name || skill;
        const sub = skill.proficiency_level || skill.priority || '';
        const tip = skill.suggestion;
        return (
          <div key={idx} style={{
            background: '#f7fafc', borderLeft: `3px solid ${color}`,
            borderRadius: '8px', padding: '0.75rem', color: '#2d3748'
          }}>
            <strong style={{ fontSize: '0.9rem' }}>{name}</strong>
            {sub && <p style={{ margin: 0, color, fontSize: '0.75rem' }}>{sub}</p>}
            {tip && <p style={{ fontSize: '0.75rem', color: '#4a5568' }}>💡 {tip}</p>}
          </div>
        );
      })}
    </div>
  </div>
);

const CollapseSection = ({ title, expanded, onToggle, bg, content }) => (
  <div style={{ marginBottom: '1rem' }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', padding: '0.75rem 1rem', border: 'none',
        borderRadius: '8px', background: bg, cursor: 'pointer',
        fontWeight: 600, color: '#2d3748', fontSize: '0.875rem'
      }}
    >
      {title}
      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    {expanded && (
      <div style={{
        background: '#fff8dc', marginTop: '0.5rem', padding: '1rem',
        borderRadius: '8px', fontSize: '0.875rem', color: '#4a5568'
      }}>
        {content}
      </div>
    )}
  </div>
);

const Header = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
    {icon}
    <h3 style={{ margin: 0, fontSize: '1rem', color: '#2d3748' }}>{title}</h3>
  </div>
);

const card = {
  background: 'white',
  borderRadius: '12px',
  padding: '1.5rem',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: '1.5rem',
};

export default SkillsAnalysis;
