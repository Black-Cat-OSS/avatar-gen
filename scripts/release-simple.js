#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Простой скрипт для создания релиза с использованием pnpm version
 */

const PACKAGE_JSON_PATH = path.join(__dirname, '..', 'package.json');

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, 'utf8'));
  return packageJson.version;
}

function main() {
  const args = process.argv.slice(2);
  const type = args[0] || 'patch';
  
  if (!['patch', 'minor', 'major'].includes(type)) {
    console.error('❌ Неверный тип версии. Используйте: patch, minor, major');
    process.exit(1);
  }
  
  console.log(`🚀 Создание релиза (${type})...`);
  
  const oldVersion = getCurrentVersion();
  console.log(`📋 Текущая версия: ${oldVersion}`);
  
  try {
    // Обновляем версию без создания тега
    console.log('📝 Обновление версии...');
    execSync(`pnpm version ${type} --no-git-tag-version`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    const newVersion = getCurrentVersion();
    console.log(`✅ Версия обновлена: ${oldVersion} → ${newVersion}`);
    
    // Создаем git тег
    console.log(`🏷️  Создание git тега v${newVersion}`);
    execSync(`git tag v${newVersion}`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    // Генерируем changelog
    console.log('📋 Генерация changelog...');
    execSync('pnpm run changelog:version', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    // Коммитим изменения
    console.log('💾 Создание коммита...');
    execSync('git add package.json CHANGELOG.md', { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    execSync(`git commit -m "chore: Release version ${newVersion}"`, { 
      encoding: 'utf8',
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit'
    });
    
    console.log('🎉 Релиз', newVersion, 'успешно создан!');
    console.log('');
    console.log('Следующие шаги:');
    console.log('  git push origin main --tags  # Отправить изменения и теги');
    console.log('  npm publish                 # Опубликовать пакет (если нужно)');
    
  } catch (error) {
    console.error('❌ Ошибка при создании релиза:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
