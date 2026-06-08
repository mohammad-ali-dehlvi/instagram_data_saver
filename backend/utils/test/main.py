import browser_cookie3 as bc

def main():
    cookies = bc.chrome(domain_name="instagram.com")

    for cookie in cookies:
        print(cookie.name, cookie.value)


if __name__ == '__main__':
    main()
    print("FOR TESTING ONLY")
