#!/usr/bin/env python3
"""
Comprehensive feature testing for Mythos Atlas web application.
Tests navigation, achievements, deity visuals, and all major features.
"""

import os
import json
import time
from playwright.sync_api import sync_playwright

# Create output directory for screenshots
OUTPUT_DIR = "/tmp/mythos_test_results"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Base URL without locale prefix (cookie-based locale detection)
BASE_URL = "http://localhost:3000"

# Shorter timeout for page loads
LOAD_TIMEOUT = 15000

def save_screenshot(page, name):
    """Save screenshot with timestamp."""
    try:
        path = f"{OUTPUT_DIR}/{name}.png"
        page.screenshot(path=path, full_page=False, timeout=5000)
        print(f"  Screenshot: {path}")
        return path
    except Exception as e:
        print(f"  Screenshot failed: {e}")
        return None

def wait_for_page(page, timeout=LOAD_TIMEOUT):
    """Wait for page to be ready."""
    try:
        page.wait_for_load_state('domcontentloaded', timeout=timeout)
        time.sleep(0.5)  # Brief pause for JS to execute
    except Exception:
        pass  # Continue even if timeout

def log_issue(issues, category, description, screenshot=None):
    """Log an issue found during testing."""
    issue = {
        "category": category,
        "description": description,
        "screenshot": screenshot
    }
    issues.append(issue)
    print(f"  ❌ ISSUE: [{category}] {description}")

def log_success(description):
    """Log a successful test."""
    print(f"  ✓ {description}")

def test_navigation_hover(page, issues):
    """Test navigation hover behavior - checking for the expand/disappear bug."""
    print("\n=== Testing Navigation Hover Behavior ===")

    wait_for_page(page)
    time.sleep(1)

    save_screenshot(page, "01_header_initial")

    # Test mega-menu dropdowns
    nav_items = ["Explore", "Discover", "Learn"]

    for item in nav_items:
        print(f"\n  Testing '{item}' dropdown...")

        # Find the navigation trigger button
        trigger = page.locator(f'button:has-text("{item}")').first

        if trigger.is_visible():
            box = trigger.bounding_box()

            # Hover over the trigger
            trigger.hover()
            time.sleep(0.5)
            save_screenshot(page, f"02_nav_{item.lower()}_hover_open")

            # Check if dropdown appeared
            dropdown_visible = False
            try:
                dropdown = page.locator('[data-state="open"]').first
                dropdown_visible = dropdown.is_visible()
            except:
                pass

            if dropdown_visible:
                log_success(f"'{item}' dropdown opens on hover")

                # Test the critical bug: move mouse down into dropdown
                if box:
                    # Move mouse down slowly to simulate entering dropdown
                    page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] + 30)
                    time.sleep(0.4)

                    # Check if dropdown is still visible
                    try:
                        still_visible = page.locator('[data-state="open"]').first.is_visible()
                    except:
                        still_visible = False

                    save_screenshot(page, f"02_nav_{item.lower()}_hover_moved")

                    if still_visible:
                        log_success(f"'{item}' dropdown stays visible when moving to it")
                    else:
                        log_issue(issues, "Navigation", f"'{item}' dropdown DISAPPEARS when moving mouse to it - hover bug!", f"02_nav_{item.lower()}_hover_moved")

                    # Move further into dropdown
                    page.mouse.move(box['x'] + box['width'] / 2, box['y'] + box['height'] + 80)
                    time.sleep(0.4)

                    try:
                        final_visible = page.locator('[data-state="open"]').first.is_visible()
                    except:
                        final_visible = False

                    save_screenshot(page, f"02_nav_{item.lower()}_hover_inside")

                    if not final_visible:
                        log_issue(issues, "Navigation", f"'{item}' dropdown disappears when mouse is inside it", f"02_nav_{item.lower()}_hover_inside")
            else:
                log_issue(issues, "Navigation", f"'{item}' dropdown did not open on hover")

            # Move away to close
            page.mouse.move(100, 100)
            time.sleep(0.3)
        else:
            log_issue(issues, "Navigation", f"'{item}' trigger button not found")

def test_deity_page(page, issues):
    """Test deity page and visual representation."""
    print("\n=== Testing Deity Page & Visuals ===")

    page.goto(f"{BASE_URL}/deities", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "03_deities_list")

    content = page.content()
    if "404" in content or "Lost in the Mists" in content:
        log_issue(issues, "Deity Page", "Deities page shows 404 error")
        return

    # Look for deity cards
    deity_cards = page.locator('article').all()
    print(f"  Found {len(deity_cards)} deity articles")

    if len(deity_cards) > 0:
        log_success(f"Deities page loaded with {len(deity_cards)} deities")

        # Click on first deity
        try:
            deity_cards[0].click(timeout=5000)
            wait_for_page(page)
            time.sleep(1)
            save_screenshot(page, "04_deity_detail")

            # Check for deity visual representation
            images = page.locator('img').all()
            has_good_visual = False
            for img in images:
                try:
                    if img.is_visible():
                        box = img.bounding_box()
                        if box and box['width'] > 100 and box['height'] > 100:
                            has_good_visual = True
                            print(f"    Found deity image: {box['width']}x{box['height']}px")
                            break
                except:
                    pass

            if not has_good_visual:
                log_issue(issues, "Deity Visual", "Deity page lacks quality visual - images are too small or basic", "04_deity_detail")
            else:
                log_success("Deity page has visual representation")
        except Exception as e:
            log_issue(issues, "Deity Page", f"Could not click deity card: {e}")
    else:
        log_issue(issues, "Deity Page", "No deity cards found on deities page")

    # Test Freyja specifically
    page.goto(f"{BASE_URL}/deities/freyja", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "04_deity_freyja")

    content = page.content()
    if "404" in content or "Lost in the Mists" in content:
        log_issue(issues, "Deity Visual", "Freyja deity page shows 404")
    else:
        # Check visual quality
        images = page.locator('img').all()
        quality_visual = False
        for img in images:
            try:
                if img.is_visible():
                    box = img.bounding_box()
                    if box and box['width'] > 150 and box['height'] > 150:
                        quality_visual = True
                        break
            except:
                pass

        if not quality_visual:
            log_issue(issues, "Deity Visual", "Freyja page lacks quality visual - deity representation is basic/small", "04_deity_freyja")
        else:
            log_success("Freyja has decent visual representation")

def test_achievements(page, issues):
    """Test achievements page and functionality."""
    print("\n=== Testing Achievements ===")

    page.goto(f"{BASE_URL}/achievements", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "05_achievements_page")

    content = page.content()
    if "404" in content or "Lost in the Mists" in content:
        log_issue(issues, "Achievements", "Achievements page shows 404 error")
        return

    # Check localStorage before action
    before_data = page.evaluate("""() => {
        const keys = Object.keys(localStorage);
        return keys.filter(k => k.toLowerCase().includes('progress') || k.toLowerCase().includes('achievement'));
    }""")
    print(f"  Progress-related localStorage keys: {before_data}")

    # Check for achievement elements
    achievement_cards = page.locator('article, [class*="achievement"], [class*="badge"]').all()
    print(f"  Found {len(achievement_cards)} achievement elements")

    if len(achievement_cards) == 0:
        log_issue(issues, "Achievements", "No achievement elements found on page")

    # Visit a deity to trigger achievement
    page.goto(f"{BASE_URL}/deities/zeus", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(2)
    save_screenshot(page, "05_after_deity_visit")

    # Check for toast/notification
    notification = page.locator('[class*="toast"], [role="alert"]').first
    if notification.is_visible():
        log_success("Achievement/progress notification appeared")
        save_screenshot(page, "05_notification")
    else:
        print("  No immediate notification visible")

    # Check localStorage after action
    after_data = page.evaluate("""() => {
        const keys = Object.keys(localStorage);
        const data = {};
        keys.forEach(k => {
            if (k.toLowerCase().includes('progress')) {
                data[k] = localStorage.getItem(k);
            }
        });
        return data;
    }""")

    if after_data:
        # Check if achievements are being tracked
        for key, value in after_data.items():
            print(f"  {key}: {value[:100] if value else 'null'}...")

        # Parse progress data to check if achievements updated
        try:
            for key, value in after_data.items():
                if value:
                    parsed = json.loads(value)
                    if isinstance(parsed, dict):
                        if 'achievements' in parsed or 'deities' in parsed or 'visited' in parsed:
                            log_success("Progress data contains tracking info")
                            break
            else:
                log_issue(issues, "Achievements", "Progress data exists but may not be updating achievements correctly")
        except:
            pass
    else:
        log_issue(issues, "Achievements", "No progress data found in localStorage after user action")

def test_quiz_page(page, issues):
    """Test quiz functionality."""
    print("\n=== Testing Quiz ===")

    page.goto(f"{BASE_URL}/quiz", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "06_quiz_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Quiz", "Quiz page shows 404")
        return

    # Look for quiz options
    cards = page.locator('article, [class*="card"]').all()
    buttons = page.locator('button').all()
    print(f"  Found {len(cards)} cards, {len(buttons)} buttons")

    if len(cards) > 0:
        try:
            cards[0].click(timeout=5000)
            time.sleep(1)
            save_screenshot(page, "06_quiz_started")
            log_success("Quiz mode selection works")
        except Exception as e:
            log_issue(issues, "Quiz", f"Cannot start quiz: {e}")
    else:
        log_issue(issues, "Quiz", "No quiz mode cards found")

def test_memory_game(page, issues):
    """Test memory game functionality."""
    print("\n=== Testing Memory Game ===")

    page.goto(f"{BASE_URL}/games/memory", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "07_memory_game")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Memory Game", "Memory game shows 404")
        return

    # Find clickable game elements
    game_elements = page.locator('button, [class*="card"], [class*="tile"]').all()
    clickable = [e for e in game_elements if e.is_visible()]
    print(f"  Found {len(clickable)} clickable game elements")

    if len(clickable) >= 2:
        try:
            clickable[0].click(timeout=3000)
            time.sleep(0.3)
            save_screenshot(page, "07_card1")

            clickable[1].click(timeout=3000)
            time.sleep(0.3)
            save_screenshot(page, "07_card2")
            log_success("Memory game interaction works")
        except Exception as e:
            log_issue(issues, "Memory Game", f"Card interaction failed: {e}")
    else:
        log_issue(issues, "Memory Game", "Not enough game elements found")

def test_collections(page, issues):
    """Test collections page."""
    print("\n=== Testing Collections ===")

    page.goto(f"{BASE_URL}/collections", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "08_collections_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Collections", "Collections page shows 404")
        return

    cards = page.locator('article').all()
    print(f"  Found {len(cards)} collection cards")

    if len(cards) > 0:
        log_success(f"Collections page shows {len(cards)} collections")
        try:
            cards[0].click(timeout=5000)
            wait_for_page(page)
            save_screenshot(page, "08_collection_detail")
            log_success("Collection detail works")
        except:
            pass
    else:
        log_issue(issues, "Collections", "No collection items found")

def test_facts_page(page, issues):
    """Test facts page."""
    print("\n=== Testing Facts Page ===")

    page.goto(f"{BASE_URL}/facts", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "09_facts_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Facts", "Facts page shows 404")
        return

    fact_elements = page.locator('article, p, [class*="fact"]').all()
    print(f"  Found {len(fact_elements)} fact elements")

    if len(fact_elements) > 0:
        log_success("Facts page has content")
    else:
        log_issue(issues, "Facts", "No fact content found")

def test_stories(page, issues):
    """Test stories page."""
    print("\n=== Testing Stories ===")

    page.goto(f"{BASE_URL}/stories", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "10_stories_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Stories", "Stories page shows 404")
        return

    cards = page.locator('article').all()
    print(f"  Found {len(cards)} story cards")

    if len(cards) > 0:
        log_success(f"Stories page shows {len(cards)} stories")
        try:
            cards[0].click(timeout=5000)
            wait_for_page(page)
            save_screenshot(page, "10_story_detail")
            log_success("Story detail works")
        except:
            pass
    else:
        log_issue(issues, "Stories", "No story items found")

def test_pantheons(page, issues):
    """Test pantheons page."""
    print("\n=== Testing Pantheons ===")

    page.goto(f"{BASE_URL}/pantheons", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "11_pantheons_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Pantheons", "Pantheons page shows 404")
        return

    cards = page.locator('article').all()
    print(f"  Found {len(cards)} pantheon cards")

    if len(cards) > 0:
        log_success(f"Pantheons page shows {len(cards)} pantheons")
        try:
            cards[0].click(timeout=5000)
            wait_for_page(page)
            save_screenshot(page, "11_pantheon_detail")
            log_success("Pantheon detail works")
        except:
            pass
    else:
        log_issue(issues, "Pantheons", "No pantheon items found")

def test_creatures(page, issues):
    """Test creatures page."""
    print("\n=== Testing Creatures ===")

    page.goto(f"{BASE_URL}/creatures", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "12_creatures_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Creatures", "Creatures page shows 404")
        return

    cards = page.locator('article').all()
    print(f"  Found {len(cards)} creature cards")

    if len(cards) > 0:
        log_success(f"Creatures page shows {len(cards)} creatures")
    else:
        log_issue(issues, "Creatures", "No creature items found")

def test_artifacts(page, issues):
    """Test artifacts page with 3D viewer."""
    print("\n=== Testing Artifacts (3D) ===")

    page.goto(f"{BASE_URL}/artifacts", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "13_artifacts_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Artifacts", "Artifacts page shows 404")
        return

    cards = page.locator('article').all()
    print(f"  Found {len(cards)} artifact cards")

    if len(cards) > 0:
        log_success(f"Artifacts page shows {len(cards)} artifacts")
        try:
            cards[0].click(timeout=5000)
            wait_for_page(page)
            time.sleep(2)  # Wait for 3D to load
            save_screenshot(page, "13_artifact_detail")

            # Check for canvas (3D renderer)
            canvas = page.locator('canvas').first
            if canvas.is_visible():
                log_success("3D artifact viewer canvas found")
            else:
                log_issue(issues, "Artifacts", "No 3D canvas found for artifact")
        except:
            pass
    else:
        log_issue(issues, "Artifacts", "No artifact items found")

def test_locations(page, issues):
    """Test locations/map page."""
    print("\n=== Testing Locations ===")

    page.goto(f"{BASE_URL}/locations", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(2)
    save_screenshot(page, "14_locations_page")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Locations", "Locations page shows 404")
        return

    # Check for map
    map_el = page.locator('[class*="leaflet"], [class*="map"], canvas, svg').first
    if map_el.is_visible():
        log_success("Locations map renders")
    else:
        cards = page.locator('article').all()
        if len(cards) > 0:
            log_success(f"Locations page shows {len(cards)} locations")
        else:
            log_issue(issues, "Locations", "No map or location elements found")

def test_family_tree(page, issues):
    """Test family tree visualization."""
    print("\n=== Testing Family Tree ===")

    page.goto(f"{BASE_URL}/family-tree", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(2)
    save_screenshot(page, "15_family_tree")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Family Tree", "Family tree shows 404")
        return

    # Check for graph elements
    graph = page.locator('[class*="react-flow"], svg, canvas').first
    if graph.is_visible():
        log_success("Family tree visualization renders")
    else:
        log_issue(issues, "Family Tree", "No graph visualization found")

def test_knowledge_graph(page, issues):
    """Test knowledge graph."""
    print("\n=== Testing Knowledge Graph ===")

    page.goto(f"{BASE_URL}/knowledge-graph", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(2)
    save_screenshot(page, "16_knowledge_graph")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Knowledge Graph", "Knowledge graph shows 404")
        return

    graph = page.locator('[class*="react-flow"], svg, canvas').first
    if graph.is_visible():
        log_success("Knowledge graph renders")
    else:
        log_issue(issues, "Knowledge Graph", "No graph found")

def test_timeline(page, issues):
    """Test timeline page."""
    print("\n=== Testing Timeline ===")

    page.goto(f"{BASE_URL}/timeline", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(2)
    save_screenshot(page, "17_timeline")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Timeline", "Timeline shows 404")
        return

    timeline = page.locator('[class*="timeline"], svg').first
    if timeline.is_visible():
        log_success("Timeline renders")
    else:
        log_issue(issues, "Timeline", "No timeline elements found")

def test_leaderboard(page, issues):
    """Test leaderboard."""
    print("\n=== Testing Leaderboard ===")

    page.goto(f"{BASE_URL}/leaderboard", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "18_leaderboard")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Leaderboard", "Leaderboard shows 404")
        return

    rankings = page.locator('[class*="rank"], tr, [class*="player"]').all()
    print(f"  Found {len(rankings)} ranking elements")

    if len(rankings) > 0:
        log_success("Leaderboard displays")
    else:
        log_issue(issues, "Leaderboard", "No ranking elements found")

def test_progress(page, issues):
    """Test progress page."""
    print("\n=== Testing Progress ===")

    page.goto(f"{BASE_URL}/progress", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "19_progress")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Progress", "Progress page shows 404")
        return

    stats = page.locator('[class*="stat"], [class*="progress"], [class*="chart"]').all()
    print(f"  Found {len(stats)} progress elements")

    if len(stats) > 0:
        log_success("Progress page displays stats")
    else:
        log_issue(issues, "Progress", "No progress elements found")

def test_compare(page, issues):
    """Test compare feature."""
    print("\n=== Testing Compare ===")

    page.goto(f"{BASE_URL}/compare", timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "20_compare")

    content = page.content()
    if "404" in content:
        log_issue(issues, "Compare", "Compare page shows 404")
        return

    selectors = page.locator('select, button, [class*="select"]').all()
    print(f"  Found {len(selectors)} interactive elements")

    if len(selectors) > 0:
        log_success("Compare page has UI elements")
    else:
        log_issue(issues, "Compare", "No comparison UI found")

def test_search(page, issues):
    """Test search functionality."""
    print("\n=== Testing Search ===")

    page.goto(BASE_URL, timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)

    # Try Cmd+K
    page.keyboard.press("Meta+k")
    time.sleep(0.5)
    save_screenshot(page, "21_search_opened")

    # Check for search dialog
    dialog = page.locator('[role="dialog"], [class*="search"]').first
    if dialog.is_visible():
        log_success("Search dialog opens with Cmd+K")

        # Try typing
        input_el = page.locator('input').first
        if input_el.is_visible():
            input_el.fill("Zeus")
            time.sleep(1)
            save_screenshot(page, "21_search_results")
            log_success("Search accepts input")
    else:
        log_issue(issues, "Search", "Search dialog not opening")

def test_mobile_nav(page, issues):
    """Test mobile navigation."""
    print("\n=== Testing Mobile Navigation ===")

    page.set_viewport_size({"width": 375, "height": 812})
    page.goto(BASE_URL, timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)
    save_screenshot(page, "22_mobile")

    # Find hamburger
    hamburger = page.locator('button').all()
    clicked = False
    for btn in hamburger:
        try:
            if btn.is_visible():
                aria = btn.get_attribute('aria-label') or ''
                if 'menu' in aria.lower() or btn.locator('svg').count() > 0:
                    btn.click(timeout=3000)
                    time.sleep(0.5)
                    save_screenshot(page, "22_mobile_menu")
                    log_success("Mobile menu opens")
                    clicked = True
                    break
        except:
            pass

    if not clicked:
        log_issue(issues, "Mobile", "Could not find/click hamburger menu")

    # Reset viewport
    page.set_viewport_size({"width": 1280, "height": 720})

def test_theme_toggle(page, issues):
    """Test dark mode toggle."""
    print("\n=== Testing Theme Toggle ===")

    page.goto(BASE_URL, timeout=LOAD_TIMEOUT)
    wait_for_page(page)
    time.sleep(1)

    initial_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
    save_screenshot(page, "23_theme_light")

    # Find theme toggle
    buttons = page.locator('button').all()
    toggled = False
    for btn in buttons:
        try:
            aria = btn.get_attribute('aria-label') or ''
            if 'theme' in aria.lower() or 'dark' in aria.lower() or 'light' in aria.lower():
                btn.click(timeout=3000)
                time.sleep(0.5)
                new_bg = page.evaluate("getComputedStyle(document.body).backgroundColor")
                save_screenshot(page, "23_theme_toggled")
                if new_bg != initial_bg:
                    log_success("Theme toggle works")
                    toggled = True
                break
        except:
            pass

    if not toggled:
        print("  Could not verify theme toggle")

def main():
    issues = []

    print("=" * 60)
    print("MYTHOS ATLAS - COMPREHENSIVE FEATURE TESTING")
    print("=" * 60)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        # Suppress console errors (CSP warnings)
        page.on("console", lambda msg: None)

        try:
            # Navigate to homepage
            print("\n=== Loading Homepage ===")
            page.goto(BASE_URL, timeout=LOAD_TIMEOUT)
            wait_for_page(page)
            time.sleep(2)
            save_screenshot(page, "00_homepage")

            content = page.content()
            if "404" in content or "Lost in the Mists" in content:
                log_issue(issues, "Homepage", "Homepage shows 404 error")
            else:
                log_success("Homepage loaded")

            # Run all tests
            test_navigation_hover(page, issues)
            test_deity_page(page, issues)
            test_achievements(page, issues)
            test_quiz_page(page, issues)
            test_memory_game(page, issues)
            test_collections(page, issues)
            test_facts_page(page, issues)
            test_stories(page, issues)
            test_pantheons(page, issues)
            test_creatures(page, issues)
            test_artifacts(page, issues)
            test_locations(page, issues)
            test_family_tree(page, issues)
            test_knowledge_graph(page, issues)
            test_timeline(page, issues)
            test_leaderboard(page, issues)
            test_progress(page, issues)
            test_compare(page, issues)
            test_search(page, issues)
            test_mobile_nav(page, issues)
            test_theme_toggle(page, issues)

        except Exception as e:
            print(f"\n❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            try:
                save_screenshot(page, "error_state")
            except:
                pass
            issues.append({
                "category": "Test Runner",
                "description": str(e),
                "screenshot": "error_state"
            })
        finally:
            browser.close()

    # Print summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    if issues:
        print(f"\n❌ Found {len(issues)} issues:\n")
        for i, issue in enumerate(issues, 1):
            print(f"{i}. [{issue['category']}] {issue['description']}")
            if issue.get('screenshot'):
                print(f"   Screenshot: {OUTPUT_DIR}/{issue['screenshot']}.png")
    else:
        print("\n✓ All tests passed!")

    # Save issues to JSON
    with open(f"{OUTPUT_DIR}/issues.json", "w") as f:
        json.dump(issues, f, indent=2)
    print(f"\nResults saved to: {OUTPUT_DIR}/issues.json")
    print(f"Screenshots saved to: {OUTPUT_DIR}/")

    return len(issues)

if __name__ == "__main__":
    exit(main())
