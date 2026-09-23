import { jsPDF } from 'jspdf';
import type { StructuredResumeData } from '../components/resume/OfficialResumeTemplateEditor';

export interface PDFExportOptions {
  theme?: 'ivy' | 'modern' | 'minimal';
  paperSize?: 'letter' | 'a4';
  filename?: string;
}

export function parseRawResumeToStructured(text: string): StructuredResumeData {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  const result: StructuredResumeData = {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: '',
    skills: {
      languages: '',
      frameworks: '',
      databasesCloud: '',
      developerTools: ''
    },
    experiences: [],
    projects: [],
    education: {
      degree: '',
      institution: '',
      location: '',
      graduationYear: '',
      cgpa: '',
      relevantCoursework: ''
    },
    certifications: []
  };

  if (lines.length === 0) {
    result.fullName = 'Engineering Candidate';
    return result;
  }

  // 1. First line is usually Candidate Name
  result.fullName = lines[0].replace(/^[#*\s]+/, '').replace(/[*#]+$/, '').trim();

  // 2. Scan remaining lines for contact info and sections
  let currentSection = 'contact'; // 'contact', 'summary', 'skills', 'projects', 'experience', 'education', 'certifications'
  let currentItem: any = null;

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const cleanLine = rawLine.replace(/^[#*\s-]+/, '').replace(/[*#:]+$/, '').trim().toLowerCase();

    // Section Header Detection
    if (/^(professional\s+)?summary|career\s+summary|objective|profile$/i.test(cleanLine)) {
      currentSection = 'summary';
      continue;
    }
    if (/^(technical\s+)?skills|technical\s+competencies|core\s+competencies|technologies$/i.test(cleanLine)) {
      currentSection = 'skills';
      continue;
    }
    if (/^(featured\s+)?(technical\s+)?projects|academic\s+projects|key\s+projects$/i.test(cleanLine)) {
      currentSection = 'projects';
      currentItem = null;
      continue;
    }
    if (/^work\s+experience|experience|internships|employment(\s+history)?$/i.test(cleanLine)) {
      currentSection = 'experience';
      currentItem = null;
      continue;
    }
    if (/^education|academic\s+background|qualifications$/i.test(cleanLine)) {
      currentSection = 'education';
      continue;
    }
    if (/^certifications|achievements|certifications\s*(&|and)\s*achievements|honors$/i.test(cleanLine)) {
      currentSection = 'certifications';
      continue;
    }

    // Process based on current section
    if (currentSection === 'contact') {
      const parts = rawLine.split(/[|•·,]/).map(p => p.trim()).filter(Boolean);
      for (const part of parts) {
        if (/[\w.-]+@[\w.-]+\.\w+/.test(part)) {
          result.email = part.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || result.email;
        } else if (/(\+?\d[\d\s-]{8,}\d)/.test(part)) {
          result.phone = part.match(/(\+?\d[\d\s-]{8,}\d)/)?.[0] || result.phone;
        } else if (/linkedin\.com/i.test(part)) {
          result.linkedinUrl = part;
        } else if (/github\.com/i.test(part)) {
          result.githubUrl = part;
        } else if (/\.(dev|io|me|app|com)/i.test(part) && !result.portfolioUrl) {
          result.portfolioUrl = part;
        } else if (!result.location && !part.includes('@') && !part.includes('http')) {
          result.location = part;
        }
      }
    } else if (currentSection === 'summary') {
      if (!result.summary) {
        result.summary = rawLine.replace(/^[*\s-]+/, '');
      } else {
        result.summary += ' ' + rawLine.replace(/^[*\s-]+/, '');
      }
    } else if (currentSection === 'skills') {
      const lower = rawLine.toLowerCase();
      const content = rawLine.replace(/^[-*•\s]*([a-zA-Z\s&/]+):/i, '').trim();
      if (/language/i.test(lower)) {
        result.skills.languages = content || result.skills.languages;
      } else if (/framework|library/i.test(lower)) {
        result.skills.frameworks = content || result.skills.frameworks;
      } else if (/database|cloud/i.test(lower)) {
        result.skills.databasesCloud = content || result.skills.databasesCloud;
      } else if (/tool|platform|devops/i.test(lower)) {
        result.skills.developerTools = content || result.skills.developerTools;
      } else if (!result.skills.languages) {
        result.skills.languages = rawLine.replace(/^[-*•\s]+/, '');
      }
    } else if (currentSection === 'projects') {
      const isBullet = /^[-*•]/.test(rawLine);
      if (!isBullet) {
        // New project title line
        const parts = rawLine.split(/[|()]/).map(p => p.trim()).filter(Boolean);
        const title = parts[0] || rawLine;
        const techs = parts.slice(1).join(', ');
        currentItem = {
          id: `prj_${Date.now()}_${result.projects.length}`,
          title: title.replace(/^[#*\s]+/, '').replace(/[*#]+$/, ''),
          technologies: techs,
          bullets: []
        };
        result.projects.push(currentItem);
      } else if (currentItem) {
        const bulletText = rawLine.replace(/^[-*•\s]+/, '').trim();
        if (bulletText) currentItem.bullets.push(bulletText);
      }
    } else if (currentSection === 'experience') {
      const isBullet = /^[-*•]/.test(rawLine);
      if (!isBullet) {
        const parts = rawLine.split(/[|—–-]/).map(p => p.trim()).filter(Boolean);
        const role = parts[0] || 'Software Engineer';
        const companyAndDur = parts.slice(1).join(' - ');
        currentItem = {
          id: `exp_${Date.now()}_${result.experiences.length}`,
          role: role.replace(/^[#*\s]+/, '').replace(/[*#]+$/, ''),
          company: companyAndDur || 'Technology Firm',
          duration: 'Recent',
          bullets: []
        };
        result.experiences.push(currentItem);
      } else if (currentItem) {
        const bulletText = rawLine.replace(/^[-*•\s]+/, '').trim();
        if (bulletText) currentItem.bullets.push(bulletText);
      }
    } else if (currentSection === 'education') {
      if (!result.education.degree) {
        const parts = rawLine.split(/[|—–-]/).map(p => p.trim()).filter(Boolean);
        result.education.degree = parts[0] || rawLine;
        if (parts[1]) result.education.institution = parts[1];
      } else if (!result.education.cgpa && /cgpa|gpa|score/i.test(rawLine)) {
        result.education.cgpa = rawLine;
      } else if (!result.education.graduationYear && /\d{4}/.test(rawLine)) {
        const match = rawLine.match(/\d{4}/);
        if (match) result.education.graduationYear = match[0];
      }
    } else if (currentSection === 'certifications') {
      const certText = rawLine.replace(/^[-*•\s]+/, '').trim();
      if (certText) result.certifications.push(certText);
    }
  }

  return result;
}

export function generateAndDownloadAtsPdf(
  input: StructuredResumeData | string,
  options: PDFExportOptions = {}
): void {
  const data: StructuredResumeData = typeof input === 'string' ? parseRawResumeToStructured(input) : input;
  const { theme = 'ivy', paperSize = 'letter', filename: customFilename } = options;

  // Standard Page Dimensions (points): Letter is 612 x 792 pt, A4 is 595.28 x 841.89 pt
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: paperSize === 'a4' ? 'a4' : 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Standard ATS Margins: 38pt (~0.53 inch) for maximum content fitting and ATS readability
  const marginX = 38;
  const contentWidth = pageWidth - marginX * 2;
  let cursorY = 40;

  // ATS Font Selection: 'times' (Ivy League / Traditional) or 'helvetica' (Modern Clean)
  const fontMain = theme === 'ivy' ? 'times' : 'helvetica';

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - 36) {
      doc.addPage();
      cursorY = 40;
    }
  };

  // Helper for Section Headers with ATS-compliant horizontal divider
  const renderSectionHeader = (title: string) => {
    checkPageBreak(30);
    cursorY += 6;

    doc.setFont(fontMain, 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42); // #0f172a
    doc.text(title.toUpperCase(), marginX, cursorY);

    cursorY += 3.5;
    doc.setDrawColor(30, 41, 59); // #1e293b
    doc.setLineWidth(0.85);
    doc.line(marginX, cursorY, marginX + contentWidth, cursorY);
    cursorY += 9.5;
  };

  // 1. Header: Full Name
  doc.setFont(fontMain, 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  const nameText = (data.fullName || 'Engineering Candidate').toUpperCase();
  doc.text(nameText, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 13.5;

  // 2. Contact Line (Centered, single-line format)
  doc.setFont(fontMain, 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // #475569

  const contactItems = [
    data.location,
    data.phone,
    data.email,
    data.githubUrl ? `github.com/${data.githubUrl.replace(/^https?:\/\/(www\.)?github\.com\/?/, '')}` : '',
    data.linkedinUrl ? `linkedin.com/in/${data.linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\/?/, '')}` : '',
    data.portfolioUrl ? data.portfolioUrl.replace(/^https?:\/\//, '') : '',
  ].filter(Boolean);

  const contactString = contactItems.join('  •  ');
  doc.text(contactString, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 9;

  // 3. Professional Summary (if present)
  if (data.summary && data.summary.trim()) {
    renderSectionHeader('Professional Summary');

    doc.setFont(fontMain, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const summaryLines = doc.splitTextToSize(data.summary.trim(), contentWidth);
    summaryLines.forEach((line: string) => {
      checkPageBreak(12.5);
      doc.text(line, marginX, cursorY);
      cursorY += 12;
    });
  }

  // 4. Technical Skills
  const hasSkills = Boolean(
    data.skills?.languages ||
    data.skills?.frameworks ||
    data.skills?.databasesCloud ||
    data.skills?.developerTools
  );

  if (hasSkills) {
    renderSectionHeader('Technical Competencies');

    const skillCategories = [
      { label: 'Languages', text: data.skills.languages },
      { label: 'Frameworks & Libraries', text: data.skills.frameworks },
      { label: 'Databases & Cloud', text: data.skills.databasesCloud },
      { label: 'Tools & Platforms', text: data.skills.developerTools },
    ].filter(sc => Boolean(sc.text && sc.text.trim()));

    skillCategories.forEach(sc => {
      checkPageBreak(13.5);
      doc.setFont(fontMain, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      const prefix = `${sc.label}: `;
      doc.text(prefix, marginX, cursorY);

      const labelWidth = doc.getTextWidth(prefix);
      doc.setFont(fontMain, 'normal');
      doc.setTextColor(30, 41, 59);

      const wrappedText = doc.splitTextToSize(sc.text.trim(), contentWidth - labelWidth);
      if (wrappedText.length > 0) {
        doc.text(wrappedText[0], marginX + labelWidth, cursorY);
        cursorY += 12;

        for (let i = 1; i < wrappedText.length; i++) {
          checkPageBreak(12);
          doc.text(wrappedText[i], marginX + labelWidth, cursorY);
          cursorY += 12;
        }
      } else {
        cursorY += 12;
      }
    });
  }

  // 5. Technical Projects
  if (data.projects && data.projects.length > 0) {
    renderSectionHeader('Technical Projects');

    data.projects.forEach(project => {
      if (!project.title?.trim()) return;

      checkPageBreak(24);
      // Project Title & Tech Stack (Left)
      doc.setFont(fontMain, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(project.title, marginX, cursorY);

      const titleWidth = doc.getTextWidth(project.title);
      if (project.technologies) {
        doc.setFont(fontMain, 'italic');
        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(` | ${project.technologies}`, marginX + titleWidth, cursorY);
      }

      // Repo or Live URL (Right)
      const linkUrl = project.repoUrl || project.liveUrl;
      if (linkUrl) {
        doc.setFont(fontMain, 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(37, 99, 235);
        const cleanLink = linkUrl.replace(/^https?:\/\//, '');
        doc.text(cleanLink, marginX + contentWidth, cursorY, { align: 'right' });
      }

      cursorY += 11.5;

      // Project Bullets
      (project.bullets || []).forEach(b => {
        if (!b.trim()) return;
        doc.setFont(fontMain, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);

        const bulletIndent = 12;
        const wrappedBullet = doc.splitTextToSize(b.trim(), contentWidth - bulletIndent);

        checkPageBreak(wrappedBullet.length * 12 + 2);
        doc.text('•', marginX + 2, cursorY);

        wrappedBullet.forEach((line: string) => {
          doc.text(line, marginX + bulletIndent, cursorY);
          cursorY += 11.5;
        });
      });

      cursorY += 2.5;
    });
  }

  // 6. Work Experience
  if (data.experiences && data.experiences.length > 0) {
    renderSectionHeader('Work Experience & Internships');

    data.experiences.forEach(exp => {
      if (!exp.company?.trim() && !exp.role?.trim()) return;

      checkPageBreak(24);
      // Role & Company (Left)
      doc.setFont(fontMain, 'bold');
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const roleText = exp.role ? `${exp.role}` : 'Software Engineer';
      doc.text(roleText, marginX, cursorY);

      const roleWidth = doc.getTextWidth(roleText);
      doc.setFont(fontMain, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const companyLocation = ` — ${exp.company}${exp.location ? ` (${exp.location})` : ''}`;
      doc.text(companyLocation, marginX + roleWidth, cursorY);

      // Duration (Right)
      if (exp.duration) {
        doc.setFont(fontMain, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(51, 65, 85);
        doc.text(exp.duration, marginX + contentWidth, cursorY, { align: 'right' });
      }

      cursorY += 11.5;

      // Experience Bullets
      (exp.bullets || []).forEach(b => {
        if (!b.trim()) return;
        doc.setFont(fontMain, 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);

        const bulletIndent = 12;
        const wrappedBullet = doc.splitTextToSize(b.trim(), contentWidth - bulletIndent);

        checkPageBreak(wrappedBullet.length * 12 + 2);
        doc.text('•', marginX + 2, cursorY);

        wrappedBullet.forEach((line: string) => {
          doc.text(line, marginX + bulletIndent, cursorY);
          cursorY += 11.5;
        });
      });

      cursorY += 2.5;
    });
  }

  // 7. Education
  if (data.education && (data.education.institution || data.education.degree)) {
    renderSectionHeader('Education');

    checkPageBreak(24);
    // Institution (Left)
    doc.setFont(fontMain, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    const instText = `${data.education.institution || 'University Institute of Technology'}${
      data.education.location ? ` (${data.education.location})` : ''
    }`;
    doc.text(instText, marginX, cursorY);

    // Graduation Year (Right)
    if (data.education.graduationYear) {
      doc.setFont(fontMain, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Graduation: ${data.education.graduationYear}`, marginX + contentWidth, cursorY, {
        align: 'right',
      });
    }

    cursorY += 11.5;

    // Degree & CGPA
    doc.setFont(fontMain, 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    const degreeCgpa = `${data.education.degree || 'B.Tech in Engineering'}${
      data.education.cgpa ? `  |  CGPA / GPA: ${data.education.cgpa}` : ''
    }`;
    doc.text(degreeCgpa, marginX, cursorY);
    cursorY += 11.5;

    // Relevant Coursework
    if (data.education.relevantCoursework) {
      checkPageBreak(13);
      doc.setFont(fontMain, 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('Relevant Coursework: ', marginX, cursorY);

      const rwWidth = doc.getTextWidth('Relevant Coursework: ');
      doc.setFont(fontMain, 'normal');
      doc.text(data.education.relevantCoursework, marginX + rwWidth, cursorY);
      cursorY += 11.5;
    }
  }

  // 8. Certifications & Honors
  if (data.certifications && data.certifications.length > 0) {
    renderSectionHeader('Certifications & Achievements');

    data.certifications.forEach(cert => {
      if (!cert.trim()) return;
      checkPageBreak(12);
      doc.setFont(fontMain, 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);

      const bulletIndent = 12;
      const wrappedCert = doc.splitTextToSize(cert.trim(), contentWidth - bulletIndent);
      doc.text('•', marginX + 2, cursorY);

      wrappedCert.forEach((line: string) => {
        doc.text(line, marginX + bulletIndent, cursorY);
        cursorY += 11.5;
      });
    });
  }

  // Generate clean filename and trigger immediate 1-click client download
  const sanitizedName = (data.fullName || 'Candidate')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = customFilename || `${sanitizedName}_Official_ATS_Resume.pdf`;

  doc.save(filename);
}

