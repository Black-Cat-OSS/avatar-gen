#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Скрипт для обновления секции [Unreleased] в CHANGELOG.md
 * Генерирует changelog для нерелизных коммитов и обновляет существующий файл
 */

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

function generateUnreleasedChangelog() {
  try {
    // Генерируем changelog для unreleased коммитов
    const output = execSync('npx conventional-changelog -p conventionalcommits -u', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..')
    });
    
    // Убираем первую строку с версией и берем только содержимое
    const lines = output.trim().split('\n');
    const contentWithoutVersionHeader = lines.slice(1).join('\n').trim();
    
    return contentWithoutVersionHeader;
  } catch (error) {
    console.error('Ошибка при генерации changelog:', error.message);
    process.exit(1);
  }
}

function updateChangelogFile(unreleasedContent) {
  try {
    // Читаем существующий файл
    const changelogContent = fs.readFileSync(CHANGELOG_PATH, 'utf8');
    
    // Простой подход: заменяем только секцию [Unreleased]
    const unreleasedRegex = /## \[Unreleased\][\s\S]*?(?=## \[(?!Unreleased)|\Z)/;
    
    let newContent;
    if (unreleasedRegex.test(changelogContent)) {
      // Заменяем существующую секцию [Unreleased]
      newContent = changelogContent.replace(
        unreleasedRegex,
        `## [Unreleased]\n\n${unreleasedContent.trim()}\n\n`
      );
    } else {
      // Добавляем секцию [Unreleased] после заголовка
      const headerEnd = changelogContent.indexOf('\n## [');
      if (headerEnd !== -1) {
        newContent = 
          changelogContent.substring(0, headerEnd) +
          '\n\n## [Unreleased]\n\n' + 
          unreleasedContent.trim() + 
          '\n\n' +
          changelogContent.substring(headerEnd);
      } else {
        newContent = changelogContent + '\n\n## [Unreleased]\n\n' + unreleasedContent.trim() + '\n\n';
      }
    }
    
    // Записываем обновленный файл
    fs.writeFileSync(CHANGELOG_PATH, newContent, 'utf8');
    console.log('✅ Секция [Unreleased] в CHANGELOG.md обновлена');
    
  } catch (error) {
    console.error('Ошибка при обновлении файла CHANGELOG.md:', error.message);
    process.exit(1);
  }
}


function main() {
  console.log('🔄 Генерация changelog для нерелизных изменений...');
  
  const unreleasedContent = generateUnreleasedChangelog();
  
  if (!unreleasedContent || unreleasedContent.trim() === '') {
    console.log('ℹ️  Нет новых изменений для добавления в секцию [Unreleased]');
    return;
  }
  
  updateChangelogFile(unreleasedContent);
  console.log('🎉 Changelog успешно обновлен!');
}

if (require.main === module) {
  main();
}

module.exports = { generateUnreleasedChangelog, updateChangelogFile };
